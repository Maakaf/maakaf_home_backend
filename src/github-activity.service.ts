import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class GithubActivityService {
  private readonly GITHUB_API_URL = 'https://api.github.com/graphql';
  private readonly SIX_MONTHS_AGO = new Date(Date.now() - 183 * 24 * 60 * 60 * 1000).toISOString();
  private readonly logger = new Logger(GithubActivityService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getUserActivity(usernames: string[]) {
    const token = this.configService.get<string>('GITHUB_TOKEN');
    const results = [];

    for (const username of usernames) {
      try {
        const repos = await this.fetchUserRepos(username, token);
        const qualifyingRepos = [];
        for (const repo of repos) {
          try {
            if (repo.forkCount <= 3) continue;
            const activity = await this.getRepoUserActivity(repo, username, token);
            qualifyingRepos.push({
              repoName: repo.name,
              description: repo.description,
              url: repo.url,
              ...activity,
            });
          } catch (repoErr) {
            this.logger.warn(`Error processing repo ${repo.name} for user ${username}: ${repoErr.message}`);
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
          { totalCommits: 0, totalPRs: 0, totalIssues: 0, totalPRComments: 0, totalIssueComments: 0 }
        );
        results.push({
          username,
          repos: qualifyingRepos,
          summary,
        });
      } catch (userErr) {
        this.logger.error(`Error processing user ${username}: ${userErr.message}`);
        results.push({ username, error: userErr.message, repos: [], summary: null });
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
        repos = repos.concat(nodes.map((repo: any) => ({
          name: repo.name,
          description: repo.description,
          url: repo.url,
          isFork: repo.isFork,
          isArchived: repo.isArchived,
          owner: repo.owner.login,
          stargazerCount: repo.stargazerCount,
          forkCount: repo.forkCount,
        })));
        if (!data.user?.repositories?.pageInfo?.hasNextPage) break;
        after = data.user.repositories.pageInfo.endCursor;
      }
    } catch (err) {
      this.logger.error(`Error fetching repos for user ${username}: ${err.message}`);
      throw err;
    }
    return repos;
  }

  private async getRepoUserActivity(repo: any, username: string, token: string) {
    const query = `
      query($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 100) {
                  nodes {
                    author { user { login } }
                    committedDate
                  }
                }
              }
            }
          }
          pullRequests(first: 100, states: [OPEN, CLOSED, MERGED], orderBy: {field: CREATED_AT, direction: DESC}) {
            nodes { 
              createdAt
              author { login }
              comments(first: 100) {
                nodes {
                  createdAt
                  author { login }
                }
              }
            }
          }
          issues(first: 100, states: [OPEN, CLOSED], orderBy: {field: CREATED_AT, direction: DESC}) {
            nodes { 
              createdAt
              author { login }
              comments(first: 100) {
                nodes {
                  createdAt
                  author { login }
                }
              }
            }
          }
        }
      }
    `;
    const variables = {
      owner: repo.owner,
      name: repo.name,
    };
    try {
      const data = await this.graphqlRequest(query, variables, token);
      this.logger.debug(`GraphQL response for repo ${repo.name} and user ${username}: ${JSON.stringify(data, null, 2)}`);
      
      // Count commits
      const commits = data.repository?.defaultBranchRef?.target?.history?.nodes || [];
      const commitCount = commits.filter((commit: any) => 
        commit.author?.user?.login === username && 
        commit.committedDate >= this.SIX_MONTHS_AGO
      ).length;
      
      // Count PRs and PR comments
      const pullRequests = data.repository?.pullRequests?.nodes || [];
      const prCount = pullRequests.filter((pr: any) => 
        pr.author?.login === username && 
        pr.createdAt >= this.SIX_MONTHS_AGO
      ).length;
      
      const prComments = pullRequests.flatMap((pr: any) => pr.comments?.nodes || [])
        .filter((comment: any) => 
          comment.author?.login === username && 
          comment.createdAt >= this.SIX_MONTHS_AGO
        ).length;
      
      // Count issues and issue comments
      const issues = data.repository?.issues?.nodes || [];
      const issueCount = issues.filter((issue: any) => 
        issue.author?.login === username && 
        issue.createdAt >= this.SIX_MONTHS_AGO
      ).length;
      
      const issueComments = issues.flatMap((issue: any) => issue.comments?.nodes || [])
        .filter((comment: any) => 
          comment.author?.login === username && 
          comment.createdAt >= this.SIX_MONTHS_AGO
        ).length;
      
      return {
        commits: commitCount,
        pullRequests: prCount,
        issues: issueCount,
        prComments: prComments,
        issueComments: issueComments,
      };
    } catch (err) {
      this.logger.error(`Error getting activity for repo ${repo.name} and user ${username}: ${err.message}`);
      throw err;
    }
  }

  private async graphqlRequest(query: string, variables: any, token: string) {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    try {
      const response$ = this.httpService.post(
        this.GITHUB_API_URL,
        { query, variables },
        { headers }
      );
      const response = await lastValueFrom(response$);
      if (response.data.errors) {
        this.logger.error(`GitHub GraphQL error: ${JSON.stringify(response.data.errors)}`);
        throw new Error('GitHub GraphQL error');
      }
      return response.data.data;
    } catch (err) {
      this.logger.error(`GraphQL request failed: ${err.message}`);
      throw err;
    }
  }
}
