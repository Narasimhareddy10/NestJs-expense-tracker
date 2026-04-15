import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AuthGuard } from '@nestjs/passport';
import { getUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
@UseGuards(AuthGuard())
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  getCategories(@getUser() user: User): Promise<Category[]> {
    return this.categoriesService.getCategories(user);
  }

  @Get(':id')
  getCategoryById(
    @Param('id') id: string,
    @getUser() user: User,
  ): Promise<Category> {
    return this.categoriesService.getCategoryById(id, user);
  }

  @Post()
  createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @getUser() user: User,
  ): Promise<Category> {
    return this.categoriesService.createCategory(createCategoryDto, user);
  }

  @Patch(':id/update')
  updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @getUser() user: User,
  ): Promise<Category> {
    return this.categoriesService.updateCategoryById(
      id,
      updateCategoryDto,
      user,
    );
  }

  @Delete(':id/delete')
  deleteCategoryById(
    @Param('id') id: string,
    @getUser() user: User,
  ): Promise<string> {
    return this.categoriesService.deleteCategoryById(id, user);
  }
}
