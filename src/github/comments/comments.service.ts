import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from './comment.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>
  ) {}

  async bulkUpsert(commentsData: Partial<Comment>[]): Promise<void> {
    const bulkOps = commentsData.map(comment => ({
      updateOne: {
        filter: { commentId: comment.commentId },
        update: { $set: comment },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await this.commentModel.bulkWrite(bulkOps);
    }
  }

  async getCommentCount(
    author: string, 
    repo: string, 
    type: string, 
    since: Date
  ): Promise<number> {
    return this.commentModel.countDocuments({
      author,
      repo,
      type,
      createdAt: { $gte: since }
    }).exec();
  }
}
