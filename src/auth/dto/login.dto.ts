import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  login!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
