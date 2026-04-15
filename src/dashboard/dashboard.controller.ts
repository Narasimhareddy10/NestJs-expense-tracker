import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '@nestjs/passport';
import { getUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';

@Controller('dashboard')
@UseGuards(AuthGuard())
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  getStats(@getUser() user: User): Promise<any> {
    return this.dashboardService.getStats(user);
  }

  @Get('trends')
  getTrends(@getUser() user: User): Promise<any> {
    return this.dashboardService.getTrends(user);
  }
}
