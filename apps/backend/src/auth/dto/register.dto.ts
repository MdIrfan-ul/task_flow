import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterInput {
    @IsEmail()
    email: string;

    @IsString()
    @IsString()
    @Transform(({ value }) => typeof value === "string" ? value.trim() : value)
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @IsString()
    name: string;

}