import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Commit extends Document {
  @Prop({ required: true })
  repo: string;

  @Prop({ required: true })
  repoOwner: string;

  @Prop({ required: true, unique: true })
  sha: string;

  @Prop({ required: true })
  committedDate: Date;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object })
  rawData: any;

  @Prop({ default: Date.now })
  fetchedAt: Date;
}

export const CommitSchema = SchemaFactory.createForClass(Commit);

// Create compound index for efficient queries
CommitSchema.index({ repo: 1, author: 1, committedDate: -1 });