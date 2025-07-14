import { Controller } from '@nestjs/common';
import { CommitsService } from './commits.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Commits (Internal)')
@Controller('commits')
export class CommitsController {
  constructor(private readonly commitsService: CommitsService) {}

  // Note: Commits are automatically managed through the GitHub activity service
  // No direct endpoints needed - commits are stored via /github endpoint
}
