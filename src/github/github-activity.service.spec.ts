import { Test, TestingModule } from '@nestjs/testing';
import { GithubActivityService } from '../github-activity.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CommitsService } from '../commits/commits.service';
import { PullRequestsService } from '../pull-requests/pull-requests.service';
import { IssuesService } from '../issues/issues.service';
import { CommentsService } from '../comments/comments.service';

describe('GithubActivityService', () => {
  let service: GithubActivityService;
  let mockCommitsService: jest.Mocked<CommitsService>;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockCommitsServiceProvider = {
      provide: CommitsService,
      useValue: {
        getCommitCount: jest.fn(),
        bulkUpsert: jest.fn(),
      },
    };

    const mockConfigServiceProvider = {
      provide: ConfigService,
      useValue: {
        get: jest.fn().mockReturnValue('mock-token'),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubActivityService,
        mockCommitsServiceProvider,
        mockConfigServiceProvider,
        {
          provide: HttpService,
          useValue: { post: jest.fn() },
        },
        {
          provide: PullRequestsService,
          useValue: { getPRCount: jest.fn(), bulkUpsert: jest.fn() },
        },
        {
          provide: IssuesService,
          useValue: { getIssueCount: jest.fn(), bulkUpsert: jest.fn() },
        },
        {
          provide: CommentsService,
          useValue: { getCommentCount: jest.fn(), bulkUpsert: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<GithubActivityService>(GithubActivityService);
    mockCommitsService = module.get(CommitsService);
    mockConfigService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserActivity', () => {
    it('should return activity data for valid usernames', async () => {
      // Mock the private methods or test through public interface
      const result = await service.getUserActivity(['testuser']);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('caching logic', () => {
    it('should use cached data when available', async () => {
      mockCommitsService.getCommitCount.mockResolvedValue(5);
      
      // Test caching behavior
      // This would require exposing some methods or testing through integration
    });
  });
});
