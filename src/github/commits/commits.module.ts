import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Commit, CommitSchema } from './commits.schema';
import { CommitsService } from './commits.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Commit.name, schema: CommitSchema }
    ])
  ],
  providers: [CommitsService],
  exports: [CommitsService], // Only export service for internal use
})
export class CommitsModule {}
