import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GithubController } from './github.controller';
import { GithubActivityService } from './github-activity.service';
import { CommitsModule } from './commits/commits.module';
import { PullRequestsModule } from './pull-requests/pull-requests.module';
import { IssuesModule } from './issues/issues.module';
import { CommentsModule } from './comments/comments.module';
import { AppConfigService } from '../config/app-config.service';

@Module({
  imports: [
    HttpModule, 
    CommitsModule, 
    PullRequestsModule, 
    IssuesModule, 
    CommentsModule
  ],
  controllers: [GithubController],
  providers: [GithubActivityService, AppConfigService],
  exports: [GithubActivityService],
})
export class GithubModule {}
