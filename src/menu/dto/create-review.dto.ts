import { IsOptional, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  authorName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(8000)
  body!: string;

  @IsOptional()
  @ValidateIf(
    (_dto: CreateReviewDto, photoUrlValue: unknown) =>
      photoUrlValue != null && photoUrlValue !== '',
  )
  @IsString()
  @MaxLength(2048)
  photoUrl?: string | null;
}
