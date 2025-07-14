import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Commit } from './commits.schema';

@Injectable()
export class CommitsService {
  constructor(
    @InjectModel(Commit.name) private commitModel: Model<Commit>
  ) {}

  async findByAuthorAndDateRange(
    author: string, 
    repo: string, 
    startDate: Date, 
    endDate: Date = new Date()
  ): Promise<Commit[]> {
    return this.commitModel.find({
      author,
      repo,
      committedDate: { $gte: startDate, $lte: endDate }
    }).exec();
  }

  async bulkUpsert(commitsData: Partial<Commit>[]): Promise<void> {
    const bulkOps = commitsData.map(commit => ({
      updateOne: {
        filter: { sha: commit.sha },
        update: { $set: commit },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await this.commitModel.bulkWrite(bulkOps);
    }
  }

  async getCommitCount(author: string, repo: string, since: Date): Promise<number> {
    return this.commitModel.countDocuments({
      author,
      repo,
      committedDate: { $gte: since }
    }).exec();
  }
}
