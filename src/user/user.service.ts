import { ConflictException, Injectable } from '@nestjs/common';
import { User } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateAuthDto } from 'src/auth/dto/create-auth.dto';
import { Model } from 'mongoose';
import { Role } from './schemas/user.types';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  async createUser(createUserDto: CreateAuthDto) {
    try {
      return await this.userModel.create({
        name: createUserDto.name,
        email: createUserDto.email,
        password: createUserDto.password,
        //default role, we can change it to createUserDto.role if we want to allow users to choose their role during registration
      });
    } catch (error: unknown) {
      console.error(error);
      const e = error as {
        code?: number;
        keyPattern?: Record<string, unknown>;
      };
      const DUPLICATE_KEY_CODE = 11000;
      if (e.code === DUPLICATE_KEY_CODE) {
        const field = e.keyPattern ? Object.keys(e.keyPattern)[0] : 'field';
        throw new ConflictException(`${field} already exists`);
      }
      throw error; // rethrow the error if it's not a duplicate key error
    }
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async getUserById(id: string) {
    return await this.userModel.findById(id).lean();
  }

  async getAllUsers() {
    return await this.userModel.find().lean();
  }

  async getUsersByRole(role: Role) {
    return await this.userModel.find({ role }).lean();
  }

  async deleteUser(id: string) {
    return await this.userModel.findByIdAndDelete(id);
  }

  async updateUserRole(id: string, role: string) {
    const allowedRoles = ['USER', 'ADMIN', 'SUPERADMIN'];

    if (!allowedRoles.includes(role)) {
      throw new ConflictException('Invalid role');
    }

    return await this.userModel.findByIdAndUpdate(id, { role }, { new: true });
  }
}
