import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Issue, IssueSchema } from './issue.schema';
import { IssuesService } from './issues.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Issue.name, schema: IssueSchema }
    ])
  ],
  providers: [IssuesService],
  exports: [IssuesService],
})
export class IssuesModule {}
