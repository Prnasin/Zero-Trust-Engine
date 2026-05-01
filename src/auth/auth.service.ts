import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { CreateAuthDto, LoginDto } from './dto/create-auth.dto';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  /*
    1. check if email already exists //user service will get import in auth service
    2. hash the password
    3. store the user in the database //user
    4. generate jwt token
    5. send token in response
    */
  async registerUser(createAuthData: CreateAuthDto) {
    console.log('registerDto', createAuthData);

    const saltRounds = 10; //number of rounds to generate salt, higher the rounds more secure but slower
    const hash = await bcrypt.hash(createAuthData.password, saltRounds);
    const user = await this.userService.createUser({
      ...createAuthData,
      password: hash,
    });
    return {
      message: 'User registered successfully',
      userId: user._id,
    };
  }

  async loginUser(loginData: LoginDto) {
    const user = await this.userService.findByEmail(loginData.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(loginData.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user._id, role: user.role, email: user.email };
    const token = await this.jwtService.signAsync(payload);
    return { access_token: token };
  }
}
