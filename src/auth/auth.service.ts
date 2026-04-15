import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/singin.dto';
import { JwtPayload } from './jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { UpdateProfileDto } from './dto/update-profile.dto';
// import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async registerUser(signUpDto: SignUpDto): Promise<string> {
    const { email, username, password, monthlyIncome, emailNotifications } =
      signUpDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
      monthlyIncome,
      emailNotifications,
    });

    try {
      await this.userRepository.save(user);
      return 'User created successfully';
    } catch (error) {
      if ((error as { code?: string })?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Email already exists');
      } else {
        throw new InternalServerErrorException('Failed to create user');
      }
    }
  }

  async signIn(signInDto: SignInDto): Promise<{ accessToken: string }> {
    const { email, password } = signInDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = { email };
      const accessToken = this.jwtService.sign(payload);
      return { accessToken };
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }

  async updateProfile(
    updateProfileDto: UpdateProfileDto,
    user: User,
  ): Promise<User> {
    const { username, monthlyIncome, emailNotifications } = updateProfileDto;

    // Validate at least one field is provided
    if (
      username === undefined &&
      monthlyIncome === undefined &&
      emailNotifications === undefined
    ) {
      throw new BadRequestException(
        'At least one field must be provided to update',
      );
    }

    // Track if any changes were made
    let hasChanges = false;

    // Only update fields that are provided and different
    if (username !== undefined && username.trim() !== user.username.trim()) {
      user.username = username.trim();
      hasChanges = true;
    }

    // Convert both to numbers for proper comparison (handles decimal type from DB)
    if (monthlyIncome !== undefined) {
      const incomingNum = Number(monthlyIncome);
      const currentNum = Number(user.monthlyIncome);
      if (incomingNum !== currentNum) {
        user.monthlyIncome = monthlyIncome;
        hasChanges = true;
      }
    }

    // Convert both to boolean for proper comparison (handles 0/1 from DB)
    if (emailNotifications !== undefined) {
      // Ensure both are proper booleans for comparison
      const incomingBool =
        typeof emailNotifications === 'string'
          ? (emailNotifications as string).toLowerCase() === 'true'
          : Boolean(emailNotifications);
      const currentBool = Boolean(user.emailNotifications);
      if (incomingBool !== currentBool) {
        user.emailNotifications = incomingBool;
        hasChanges = true;
      }
    }

    // If no changes detected, throw error
    if (!hasChanges) {
      throw new ConflictException('No changes detected in the provided data');
    }

    await this.userRepository.save(user);

    return user;
  }
}
