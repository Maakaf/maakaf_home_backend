import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Issue extends Document {
  @Prop({ required: true })
  repo: string;

  @Prop({ required: true })
  repoOwner: string;

  @Prop({ required: true })
  issueNumber: number;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  state: string; // OPEN, CLOSED

  @Prop({ required: true })
  createdAt: Date;

  @Prop()
  closedAt?: Date;

  @Prop({ type: Object })
  rawData: any;

  @Prop({ default: Date.now })
  fetchedAt: Date;
}

export const IssueSchema = SchemaFactory.createForClass(Issue);

// Create compound index for efficient queries
IssueSchema.index({ repo: 1, author: 1, createdAt: -1 });
IssueSchema.index({ repo: 1, issueNumber: 1 }, { unique: true });
