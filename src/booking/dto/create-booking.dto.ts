import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { IsVisitDate } from '../../common/validators/is-visit-date.decorator';

export class CreateBookingDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tableId!: number;

  @IsVisitDate()
  visitDate!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  guestCount!: number;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  contactName!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(64)
  contactPhone!: string;

  @IsOptional()
  @ValidateIf(
    (validatedBooking: CreateBookingDto, contactEmailValue: unknown) =>
      contactEmailValue != null && contactEmailValue !== '',
  )
  @IsEmail()
  contactEmail?: string | null;
}
