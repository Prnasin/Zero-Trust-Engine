import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto, LoginDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { RiskGuard } from 'src/common/guards/risk.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  //method to recieve data send by client use body decorator
  async register(@Body() createAuthData: CreateAuthDto) {
    //dto class passed
    // const createdUser = await this.authService.registerUser(registerUserDto);
    // return createdUser;
    //getting user from service
    return await this.authService.registerUser(createAuthData);
    //when user registers we want to send token in response, so we will return token from service and send it in response
  }
  @UseGuards(RiskGuard)
  @Post('login')
  async login(
    @Body() loginData: LoginDto,
    @Request() req: { context: { ip: string } },
  ) {
    loginData.ip = req.context.ip;
    return await this.authService.loginUser(loginData);
  }
}
