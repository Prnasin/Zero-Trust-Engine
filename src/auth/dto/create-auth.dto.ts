import { IsEmail, IsString, IsNotEmpty, MinLength, IsEnum } from 'class-validator';

export class CreateAuthDto {
    @IsString()
    @IsNotEmpty()
    name!: string;


    @IsEmail()
    email!: string;

    @IsString()
    // @MinLength(6)
    password!: string;
    
    @IsEnum(['ADMIN', 'SUPERADMIN', 'USER'], {
        message: 'valid role required'
    }) //validation for role, it will check if the role is one of the values in the enum or not
    role!: "ADMIN" | "SUPERADMIN" | "USER";
}

export class LoginDto {
    @IsEmail()
    email!: string;

    @IsString()
    // @MinLength(6)
    password!: string;
}