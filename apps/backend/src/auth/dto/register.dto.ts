import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterInput {
    @IsEmail()
    @IsNotEmpty()
    @Transform(({ value }) => typeof value === "string" ? value.trim() : value)
    email: string;

    @IsString()
    @IsString()
    @Transform(({ value }) => typeof value === "string" ? value.trim() : value)
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(16)
    password: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(25)
    name: string;

}