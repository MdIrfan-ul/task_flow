// auth/dto/login.dto.ts
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    @Transform(({ value }) => typeof value === "string" ? value.trim() : value)
    email: string;

    @IsString()
    @Transform(({ value }) => typeof value === "string" ? value.trim() : value)
    @IsString()
    @IsNotEmpty()
    @MinLength(8)

    password: string;
}