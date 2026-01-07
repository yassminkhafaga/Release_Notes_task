import { IsArray, IsString, MaxLength } from 'class-validator';

export class PullRequestDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsArray()
  @IsString({ each: true })
  labels: string[];

    @IsString()
    author: string;
}
