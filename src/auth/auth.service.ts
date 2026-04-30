import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto, LoginDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UserService } from 'src/user/user.service';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
        private readonly userService: UserService,
        // private readonly jwtService: JwtService
    ) {}
    
    async registerUser(createAuthData: CreateAuthDto) {
        console.log('registerDto',createAuthData);

        const saltRounds = 10; //number of rounds to generate salt, higher the rounds more secure but slower
        const hash = await bcrypt.hash(createAuthData.password, saltRounds)
        const user = await this.userService.createUser({
            ...createAuthData, 
            password: hash
        }); 
        return {
            message: 'User registered successfully',
            
        };
    }

    // async loginUser(loginDto: LoginDto) {
    //     const user = await this.userService.findByEmail(loginDto.email);
    //     if (!user) {
    //         throw new UnauthorizedException('Invalid credentials');
    //     }
        
    //     const isMatch = await bcrypt.compare(loginDto.password, user.password);
    //     if (!isMatch) {
    //         throw new UnauthorizedException('Invalid credentials');
    //     }
    //     const payload = { sub: user._id, role: user.role, email: user.email };
    //     const token = await this.jwtService.signAsync(payload);
    //     return { access_token: token };
    // }
}
