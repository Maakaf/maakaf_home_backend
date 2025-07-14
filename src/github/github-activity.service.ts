import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";
import { CommitsService } from "./commits/commits.service";
import { PullRequestsService } from "./pull-requests/pull-requests.service";
import { IssuesService } from "./issues/issues.service";
import { CommentsService } from "./comments/comments.service";

@Injectable()
export class GithubActivityService {
  private readonly GITHUB_API_URL = "https://api.github.com/graphql";
  private readonly SIX_MONTHS_AGO = new Date(
    Date.now() - 183 * 24 * 60 * 60 * 1000
  ).toISOString();
  private readonly logger = new Logger(GithubActivityService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly commitsService: CommitsService,
    private readonly pullRequestsService: PullRequestsService,
    private readonly issuesService: IssuesService,
    private readonly commentsService: CommentsService
  ) {}

  async getUserActivity(usernames: string[]) {
    const token = this.configService.get<string>("GITHUB_TOKEN");
    const results = [];

    for (const username of usernames) {
      try {
        const repos = await this.fetchUserRepos(username, token);
        const qualifyingRepos = [];
        for (const repo of repos) {
          try {
            if (repo.forkCount <= 3) continue;
            const activityLast6Months = await this.getRepoUserActivity(
              repo,
              username,
              token
            );
            // Only include repos with activity in the last 6 months
            if (
              activityLast6Months.commits === 0 &&
              activityLast6Months.pullRequests === 0 &&
              activityLast6Months.issues === 0 &&
              activityLast6Months.prComments === 0 &&
              activityLast6Months.issueComments === 0
            ) {
              continue;
            }
            qualifyingRepos.push({
              repoName: repo.name,
              description: repo.description,
              url: repo.url,
              ...activityLast6Months,
            });
          } catch (repoErr) {
            this.logger.warn(
              `Error processing repo ${repo.name} for user ${username}: ${repoErr.message}`
            );
          }
        }

        const summary = qualifyingRepos.reduce(
          (acc, repo) => ({
            totalCommits: acc.totalCommits + repo.commits,
            totalPRs: acc.totalPRs + repo.pullRequests,
            totalIssues: acc.totalIssues + repo.issues,
            totalPRComments: acc.totalPRComments + repo.prComments,
            totalIssueComments: acc.totalIssueComments + repo.issueComments,
          }),
          {
            totalCommits: 0,
            totalPRs: 0,
            totalIssues: 0,
            totalPRComments: 0,
            totalIssueComments: 0,
          }
        );
        results.push({
          username,
          repos: qualifyingRepos,
          summary,
        });
      } catch (userErr) {
        this.logger.error(
          `Error processing user ${username}: ${userErr.message}`
        );
        results.push({
          username,
          error: userErr.message,
          repos: [],
          summary: null,
        });
      }
    }
    return results;
  }

  private async fetchUserRepos(username: string, token: string) {
    const query = `
      query($login: String!, $after: String) {
        user(login: $login) {
          repositories(first: 100, privacy: PUBLIC, after: $after) {
            nodes {
              name
              description
              url
              isFork
              isArchived
              owner { login }
              stargazerCount
              forkCount
            }
            pageInfo { hasNextPage endCursor }
          }
        }
      }
    `;
    let repos = [];
    let after = null;
    try {
      while (true) {
        const variables = { login: username, after };
        const data = await this.graphqlRequest(query, variables, token);
        const nodes = data.user?.repositories?.nodes || [];
        repos = repos.concat(
          nodes.map((repo: any) => ({
            name: repo.name,
            description: repo.description,
            url: repo.url,
            isFork: repo.isFork,
            isArchived: repo.isArchived,
            owner: repo.owner.login,
            stargazerCount: repo.stargazerCount,
            forkCount: repo.forkCount,
          }))
        );
        if (!data.user?.repositories?.pageInfo?.hasNextPage) break;
        after = data.user.repositories.pageInfo.endCursor;
      }
    } catch (err) {
      this.logger.error(
        `Error fetching repos for user ${username}: ${err.message}`
      );
      throw err;
    }
    return repos;
  }

  private async getRepoUserActivity(
    repo: any,
    username: string,
    token: string
  ) {
    const repoFullName = `${repo.owner}/${repo.name}`;
    const sixMonthsAgo = new Date(this.SIX_MONTHS_AGO);
    
    this.logger.debug(`Checking cached data for ${username} in ${repoFullName}`);
    
    // Check cached data for all activity types
    const [
      cachedCommitCount,
      cachedPRCount,
      cachedIssueCount,
      cachedPRCommentCount,
      cachedIssueCommentCount
    ] = await Promise.all([
      this.commitsService.getCommitCount(username, repoFullName, sixMonthsAgo),
      this.pullRequestsService.getPRCount(username, repoFullName, sixMonthsAgo),
      this.issuesService.getIssueCount(username, repoFullName, sixMonthsAgo),
      this.commentsService.getCommentCount(username, repoFullName, 'PR', sixMonthsAgo),
      this.commentsService.getCommentCount(username, repoFullName, 'ISSUE', sixMonthsAgo)
    ]);
    
    // If we have any cached data, use it (optimization: assume if one type is cached, all are)
    const totalCachedActivity = cachedCommitCount + cachedPRCount + cachedIssueCount + 
                               cachedPRCommentCount + cachedIssueCommentCount;
    
    if (totalCachedActivity > 0) {
      this.logger.debug(`Using cached data for ${username} in ${repoFullName}`);
      return {
        commits: cachedCommitCount,
        pullRequests: cachedPRCount,
        issues: cachedIssueCount,
        prComments: cachedPRCommentCount,
        issueComments: cachedIssueCommentCount,
      };
    }
    
    // No cached data found, fetch from GitHub API
    this.logger.debug(`No cached data found for ${username} in ${repoFullName}, fetching from GitHub API`);
    
    return await this.fetchAndCacheRepoActivity(repo, username, token);
  }

  private async fetchAndCacheRepoActivity(repo: any, username: string, token: string) {
    const repoFullName = `${repo.owner}/${repo.name}`;
    const sixMonthsAgo = new Date(this.SIX_MONTHS_AGO);
    
    const query = `
      query($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 100) {
                  nodes {
                    sha
                    author { user { login } }
                    committedDate
                    message
                  }
                }
              }
            }
          }
          pullRequests(first: 100, states: [OPEN, CLOSED, MERGED], orderBy: {field: CREATED_AT, direction: DESC}) {
            nodes { 
              number
              title
              state
              createdAt
              closedAt
              mergedAt
              author { login }
              comments(first: 100) {
                nodes {
                  id
                  body
                  createdAt
                  author { login }
                }
              }
            }
          }
          issues(first: 100, states: [OPEN, CLOSED], orderBy: {field: CREATED_AT, direction: DESC}) {
            nodes { 
              number
              title
              state
              createdAt
              closedAt
              author { login }
              comments(first: 100) {
                nodes {
                  id
                  body
                  createdAt
                  author { login }
                }
              }
            }
          }
        }
      }
    `;
    
    const variables = { owner: repo.owner, name: repo.name };
    
    try {
      const data = await this.graphqlRequest(query, variables, token);
      
      // Process commits
      const commits = data.repository?.defaultBranchRef?.target?.history?.nodes || [];
      const userCommits = commits.filter((commit: any) => 
        commit.author?.user?.login === username
      );
      
      const commitsToStore = userCommits.map((commit: any) => ({
        repo: repoFullName,
        repoOwner: repo.owner,
        sha: commit.sha,
        committedDate: new Date(commit.committedDate),
        author: username,
        message: commit.message,
        rawData: commit,
        fetchedAt: new Date()
      }));

      // Process Pull Requests
      const pullRequests = data.repository?.pullRequests?.nodes || [];
      const userPRs = pullRequests.filter((pr: any) => pr.author?.login === username);
      
      const prsToStore = userPRs.map((pr: any) => ({
        repo: repoFullName,
        repoOwner: repo.owner,
        prNumber: pr.number,
        author: username,
        title: pr.title,
        state: pr.state,
        createdAt: new Date(pr.createdAt),
        closedAt: pr.closedAt ? new Date(pr.closedAt) : undefined,
        mergedAt: pr.mergedAt ? new Date(pr.mergedAt) : undefined,
        rawData: pr,
        fetchedAt: new Date()
      }));

      // Process Issues
      const issues = data.repository?.issues?.nodes || [];
      const userIssues = issues.filter((issue: any) => issue.author?.login === username);
      
      const issuesToStore = userIssues.map((issue: any) => ({
        repo: repoFullName,
        repoOwner: repo.owner,
        issueNumber: issue.number,
        author: username,
        title: issue.title,
        state: issue.state,
        createdAt: new Date(issue.createdAt),
        closedAt: issue.closedAt ? new Date(issue.closedAt) : undefined,
        rawData: issue,
        fetchedAt: new Date()
      }));

      // Process Comments (PR and Issue comments)
      const allComments = [];
      
      // PR Comments
      pullRequests.forEach((pr: any) => {
        const prComments = pr.comments?.nodes || [];
        prComments.forEach((comment: any) => {
          if (comment.author?.login === username) {
            allComments.push({
              repo: repoFullName,
              repoOwner: repo.owner,
              commentId: comment.id,
              author: username,
              type: 'PR',
              parentNumber: pr.number,
              createdAt: new Date(comment.createdAt),
              body: comment.body,
              rawData: comment,
              fetchedAt: new Date()
            });
          }
        });
      });
      
      // Issue Comments
      issues.forEach((issue: any) => {
        const issueComments = issue.comments?.nodes || [];
        issueComments.forEach((comment: any) => {
          if (comment.author?.login === username) {
            allComments.push({
              repo: repoFullName,
              repoOwner: repo.owner,
              commentId: comment.id,
              author: username,
              type: 'ISSUE',
              parentNumber: issue.number,
              createdAt: new Date(comment.createdAt),
              body: comment.body,
              rawData: comment,
              fetchedAt: new Date()
            });
          }
        });
      });

      // Store all data in parallel
      await Promise.all([
        commitsToStore.length > 0 ? this.commitsService.bulkUpsert(commitsToStore) : Promise.resolve(),
        prsToStore.length > 0 ? this.pullRequestsService.bulkUpsert(prsToStore) : Promise.resolve(),
        issuesToStore.length > 0 ? this.issuesService.bulkUpsert(issuesToStore) : Promise.resolve(),
        allComments.length > 0 ? this.commentsService.bulkUpsert(allComments) : Promise.resolve()
      ]);

      // Count activity from the last 6 months
      const commitCount = userCommits.filter((commit: any) =>
        new Date(commit.committedDate).getTime() >= sixMonthsAgo.getTime()
      ).length;

      const prCount = userPRs.filter((pr: any) =>
        new Date(pr.createdAt).getTime() >= sixMonthsAgo.getTime()
      ).length;

      const issueCount = userIssues.filter((issue: any) =>
        new Date(issue.createdAt).getTime() >= sixMonthsAgo.getTime()
      ).length;

      const prCommentCount = allComments.filter((comment: any) =>
        comment.type === 'PR' && new Date(comment.createdAt).getTime() >= sixMonthsAgo.getTime()
      ).length;

      const issueCommentCount = allComments.filter((comment: any) =>
        comment.type === 'ISSUE' && new Date(comment.createdAt).getTime() >= sixMonthsAgo.getTime()
      ).length;

      this.logger.debug(`Cached ${commitsToStore.length} commits, ${prsToStore.length} PRs, ${issuesToStore.length} issues, ${allComments.length} comments for ${username} in ${repoFullName}`);

      return {
        commits: commitCount,
        pullRequests: prCount,
        issues: issueCount,
        prComments: prCommentCount,
        issueComments: issueCommentCount,
      };
      
    } catch (err) {
      this.logger.error(
        `Error fetching and caching activity for repo ${repo.name} and user ${username}: ${err.message}`
      );
      throw err;
    }
  }

  private async graphqlRequest(query: string, variables: any, token: string) {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    try {
      const response$ = this.httpService.post(
        this.GITHUB_API_URL,
        { query, variables },
        { headers }
      );
      const response = await lastValueFrom(response$);
      if (response.data.errors) {
        this.logger.error(
          `GitHub GraphQL error: ${JSON.stringify(response.data.errors)}`
        );
        throw new Error("GitHub GraphQL error");
      }
      return response.data.data;
    } catch (err) {
      this.logger.error(`GraphQL request failed: ${err.message}`);
      throw err;
    }
  }
}
