import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PullRequest, PullRequestSchema } from './pull-request.schema';
import { PullRequestsService } from './pull-requests.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PullRequest.name, schema: PullRequestSchema }
    ])
  ],
  providers: [PullRequestsService],
  exports: [PullRequestsService],
})
export class PullRequestsModule {}
