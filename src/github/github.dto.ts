import { IsArray, ArrayNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GithubUsersDto {
  @ApiProperty({
    description: 'Array of GitHub usernames',
    example: ['UrielOfir'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  usernames: string[];

  @ApiProperty({
    description: 'Optional array of GitHub repositories in "owner/repo" format',
    example: ['octocat/Hello-World'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  repositories?: string[]; // Array of "owner/repo" strings
}