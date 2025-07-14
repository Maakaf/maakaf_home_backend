import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserProfile } from './user-profile.schema';

@Injectable()
export class UserProfilesService {
  constructor(
    @InjectModel(UserProfile.name) private userProfileModel: Model<UserProfile>
  ) {}

  async findByUsername(username: string): Promise<UserProfile | null> {
    return this.userProfileModel.findOne({ username }).exec();
  }

  async upsert(profileData: Partial<UserProfile>): Promise<UserProfile | null> {
    return this.userProfileModel.findOneAndUpdate(
      { username: profileData.username },
      { $set: { ...profileData, fetchedAt: new Date() } },
      { upsert: true, new: true }
    ).exec();
  }

  async isProfileCacheValid(username: string, cacheExpiryDate: Date): Promise<boolean> {
    const profile = await this.userProfileModel.findOne({ 
      username, 
      fetchedAt: { $gte: cacheExpiryDate } 
    }).exec();
    
    return !!profile;
  }
}
