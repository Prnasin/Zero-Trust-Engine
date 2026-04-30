import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @UseGuards(AuthGuard)
  // @Get('profile')
  // async getProfile(@Request() req) {
  //   const userId = req.user.sub;

  //   const user = await this.userService.getUserById(userId);

  //   return {
  //     id: user?._id,
  //     fname: user?.fname,
  //     lname: user?.lname,
  //     email: user?.email,
  //     role: user?.role,
  //   };
  // }

}


