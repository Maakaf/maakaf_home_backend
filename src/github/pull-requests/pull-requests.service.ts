import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PullRequest } from './pull-request.schema';

@Injectable()
export class PullRequestsService {
  constructor(
    @InjectModel(PullRequest.name) private pullRequestModel: Model<PullRequest>
  ) {}

  async findAll(): Promise<PullRequest[]> {
    return this.pullRequestModel.find().exec();
  }

  async findByRepo(repo: string): Promise<PullRequest[]> {
    return this.pullRequestModel.find({ repo }).exec();
  }

  async findByAuthorAndRepo(author: string, repo: string): Promise<PullRequest[]> {
    return this.pullRequestModel.find({ author, repo }).exec();
  }

  async findByAuthorAndDateRange(
    author: string, 
    repo: string, 
    startDate: Date, 
    endDate: Date = new Date()
  ): Promise<PullRequest[]> {
    return this.pullRequestModel.find({
      author,
      repo,
      createdAt: { $gte: startDate, $lte: endDate }
    }).exec();
  }

  async upsert(prData: Partial<PullRequest>): Promise<PullRequest | null> {
    return this.pullRequestModel.findOneAndUpdate(
      { repo: prData.repo, prNumber: prData.prNumber },
      { $set: prData },
      { upsert: true, new: true }
    ).exec();
  }

  async bulkUpsert(prsData: Partial<PullRequest>[]): Promise<void> {
    const bulkOps = prsData.map(pr => ({
      updateOne: {
        filter: { repo: pr.repo, prNumber: pr.prNumber },
        update: { $set: pr },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await this.pullRequestModel.bulkWrite(bulkOps);
    }
  }

  async getPRCount(author: string, repo: string, since: Date): Promise<number> {
    return this.pullRequestModel.countDocuments({
      author,
      repo,
      createdAt: { $gte: since }
    }).exec();
  }
}
