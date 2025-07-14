import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class UserProfile extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop()
  displayName?: string;

  @Prop()
  bio?: string;

  @Prop()
  avatarUrl?: string;

  @Prop()
  location?: string;

  @Prop()
  company?: string;

  @Prop()
  blog?: string;

  @Prop()
  twitterUsername?: string;

  @Prop()
  email?: string;

  @Prop()
  publicRepos: number;

  @Prop()
  followers: number;

  @Prop()
  following: number;

  @Prop()
  accountType: string; // 'User' or 'Organization'

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ type: Object })
  rawData: any;

  @Prop({ default: Date.now })
  fetchedAt: Date;
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);

// Note: username index is already created automatically by the unique: true property
