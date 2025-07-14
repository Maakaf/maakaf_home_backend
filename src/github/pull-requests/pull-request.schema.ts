import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PullRequest extends Document {
  @Prop({ required: true })
  repo: string;

  @Prop({ required: true })
  repoOwner: string;

  @Prop({ required: true })
  prNumber: number;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  state: string; // OPEN, CLOSED, MERGED

  @Prop({ required: true })
  createdAt: Date;

  @Prop()
  closedAt?: Date;

  @Prop()
  mergedAt?: Date;

  @Prop({ type: Object })
  rawData: any;

  @Prop({ default: Date.now })
  fetchedAt: Date;
}

export const PullRequestSchema = SchemaFactory.createForClass(PullRequest);

// Create compound index for efficient queries
PullRequestSchema.index({ repo: 1, author: 1, createdAt: -1 });
PullRequestSchema.index({ repo: 1, prNumber: 1 }, { unique: true });
