import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/singin.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './user.entity';
import { AuthGuard } from '@nestjs/passport';
import { getUser } from './get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signUp(@Body() signUpDto: SignUpDto): Promise<string> {
    return this.authService.registerUser(signUpDto);
  }

  @Post('signin')
  signIn(@Body() signInDto: SignInDto): Promise<{ accessToken: string }> {
    return this.authService.signIn(signInDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard())
  getProfile(@getUser() user: User): User {
    return user;
  }

  @Patch('update/profile')
  @UseGuards(AuthGuard())
  updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @getUser() user: User,
  ): Promise<User> {
    return this.authService.updateProfile(updateProfileDto, user);
  }
}
