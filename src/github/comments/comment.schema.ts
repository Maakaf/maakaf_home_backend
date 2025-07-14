import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Comment extends Document {
  @Prop({ required: true })
  repo: string;

  @Prop({ required: true })
  repoOwner: string;

  @Prop({ required: true })
  commentId: string;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  type: string; // 'PR' or 'ISSUE'

  @Prop({ required: true })
  parentNumber: number; // PR number or Issue number

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  body: string;

  @Prop({ type: Object })
  rawData: any;

  @Prop({ default: Date.now })
  fetchedAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

// Create compound index for efficient queries
CommentSchema.index({ repo: 1, author: 1, createdAt: -1 });
CommentSchema.index({ commentId: 1 }, { unique: true });
