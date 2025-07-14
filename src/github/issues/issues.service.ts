import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Issue } from './issue.schema';

@Injectable()
export class IssuesService {
  constructor(
    @InjectModel(Issue.name) private issueModel: Model<Issue>
  ) {}

  async findByAuthorAndDateRange(
    author: string, 
    repo: string, 
    startDate: Date, 
    endDate: Date = new Date()
  ): Promise<Issue[]> {
    return this.issueModel.find({
      author,
      repo,
      createdAt: { $gte: startDate, $lte: endDate }
    }).exec();
  }

  async bulkUpsert(issuesData: Partial<Issue>[]): Promise<void> {
    const bulkOps = issuesData.map(issue => ({
      updateOne: {
        filter: { repo: issue.repo, issueNumber: issue.issueNumber },
        update: { $set: issue },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await this.issueModel.bulkWrite(bulkOps);
    }
  }

  async getIssueCount(author: string, repo: string, since: Date): Promise<number> {
    return this.issueModel.countDocuments({
      author,
      repo,
      createdAt: { $gte: since }
    }).exec();
  }
}
