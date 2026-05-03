import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserRoleDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from './schemas/user.types';
import { Action, Resource } from 'src/common/decorators/policy.decorator';
import { PolicyGuard } from 'src/common/guards/policy.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const userId = req.user.sub;

    const user = await this.userService.getUserById(userId);

    return {
      id: user?._id,
      name: user?.name,
      email: user?.email,
      role: user?.role,
    };
  }

  @UseGuards(AuthGuard, RolesGuard, PolicyGuard) //login wala role
  @Resource('user')
  @Action('findAll')
  @Roles(Role.ADMIN) //dmin and superadmin can access this route, because in roles guard we have defined role hierarchy, so admin has access to all the routes which require role less than or equal to admin
   //as a user trying to access admin ki api, it will give forbidden error, but if we login as admin and try to access admin ki api, it will give us the data, because in roles guard we have defined role hierarchy, so admin has access to all the routes which require role less than or equal to admin
  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  // Superadmin only 
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Get('system-data')
  getSystemData() {
    return { message: 'Sensitive system data' };
  }

  //  Admin only
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN) //admin can get user by id
  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  //  Update role (superadmin only)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN) //only superadmin can update role of other users and admin, because in roles guard we have defined role hierarchy, so superadmin has access to all the routes which require role less than or equal to superadmin
  @Patch('role/update')
  updateUserRole(@Body() updateUserData: UpdateUserRoleDto) {
    return this.userService.updateUserRole(
      updateUserData.userId,
      updateUserData.role,
    );
  }

@UseGuards(AuthGuard, RolesGuard, PolicyGuard)
@Resource('user')
@Action('delete')
@Roles(Role.USER) //admin and superadmin can delete user, because in roles guard we have defined role hierarchy, so admin has access to all the routes which require role less than or equal to admin
@Delete(':id')
deleteUser() {
  return "User deleted";
}
}
