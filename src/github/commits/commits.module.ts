import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Commit, CommitSchema } from './commits.schema'; // adjust path as needed
import { CommitsService } from './commits.service';
import { CommitsController } from './commits.controller'; // if you have a controller

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Commit.name, schema: CommitSchema }
    ])
  ],
  providers: [CommitsService],
  controllers: [CommitsController], // if you have a controller
  exports: [CommitsService], // if you want to use the service elsewhere
})
export class CommitsModule {}
