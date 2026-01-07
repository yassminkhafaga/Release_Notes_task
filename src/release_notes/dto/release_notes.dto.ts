//input: version, date, repository name, and an array of pull requests 
import { IsArray, IsString, MaxLength, ValidateNested, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { PullRequestDto } from './pull_request.dto';
export class ReleaseNotesDto {
@IsString()
version: string;
@IsString()
date: string;
@IsString()
repository: string;

@IsArray()
@ValidateNested({ each: true })
@ArrayMaxSize(200)
@Type(() => PullRequestDto)
pullRequests: PullRequestDto[];

}