// import { PartialType } from '@nestjs/mapped-types';
// import { CreateUserDto } from './create-user.dto';

// export class UpdateUserDto extends PartialType(CreateUserDto) {}
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from 'src/user/schemas/user.types';

export class UpdateUserRoleDto {
  @IsEnum(Role)
  role!: Role;

  @IsNotEmpty()
  userId!: string;
}
