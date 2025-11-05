import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    try {
      // Check if user already exists
      const existingUser = await this.usersRepository.findOne({
        where: { email: registerUserDto.email },
      });

      if (existingUser) {
        throw new HttpException('Email already in use', HttpStatus.BAD_REQUEST);
      }

      // Hash password
      let hashedPassword: string;
      try {
        hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
      } catch (error) {
        throw new HttpException('Error hashing password', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Create new user
      try {
        const user = this.usersRepository.create({
          email: registerUserDto.email,
          password: hashedPassword,
        });
        await this.usersRepository.save(user);
        const { password, ...result } = user;
        return result;
      } catch (error) {
        throw new HttpException('Error creating user', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
