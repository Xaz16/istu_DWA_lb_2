import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class ListDishesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sectionId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minWeight?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxWeight?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minCalories?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxCalories?: number;

  @IsOptional()
  @IsIn(['true', 'false'])
  hasAllergens?: 'true' | 'false';

  @IsOptional()
  @IsIn(['true', 'false'])
  isSpicy?: 'true' | 'false';

  @IsOptional()
  @IsIn(['true', 'false'])
  kidFriendly?: 'true' | 'false';

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  q?: string;
}
