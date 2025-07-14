import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Commit } from './commits.schema';

@Injectable()
export class CommitsService {
  constructor(
    @InjectModel(Commit.name) private commitModel: Model<Commit>
  ) {}

  async findAll(): Promise<Commit[]> {
    return this.commitModel.find().exec();
  }

  async findOneBySha(sha: string): Promise<Commit | null> {
    return this.commitModel.findOne({ sha }).exec();
  }

  async findByRepo(repo: string): Promise<Commit[]> {
    return this.commitModel.find({ repo }).exec();
  }

  async findByAuthorAndRepo(author: string, repo: string): Promise<Commit[]> {
    return this.commitModel.find({ author, repo }).exec();
  }

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

  async create(commitData: Partial<Commit>): Promise<Commit> {
    const created = new this.commitModel(commitData);
    return created.save();
  }

  async upsert(commitData: Partial<Commit>): Promise<Commit | null> {
    return this.commitModel.findOneAndUpdate(
      { sha: commitData.sha },
      { $set: commitData },
      { upsert: true, new: true }
    ).exec();
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

  async deleteBySha(sha: string): Promise<{ deletedCount?: number }> {
    return this.commitModel.deleteOne({ sha }).exec();
  }

  async getCommitCount(author: string, repo: string, since: Date): Promise<number> {
    return this.commitModel.countDocuments({
      author,
      repo,
      committedDate: { $gte: since }
    }).exec();
  }
}
