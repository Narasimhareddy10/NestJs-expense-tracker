import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { User } from 'src/auth/user.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getCategories(user: User): Promise<Category[]> {
    return await this.categoryRepository.find({
      where: [{ isCustom: false }, { createdByUserId: user?.id }],
      order: { isCustom: 'ASC', name: 'ASC' },
    });
  }

  async getCategoryById(id: string, user: User): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with id ${id}  not found`);
    }

    if (category?.isCustom && category?.createdByUserId !== user?.id) {
      throw new ForbiddenException('Access Denied');
    }

    return category;
  }

  async createCategory(
    createCategoryDto: CreateCategoryDto,
    user: User,
  ): Promise<Category> {
    const { name, icon } = createCategoryDto;

    const exists = await this.categoryRepository.findOne({
      where: { name, createdByUserId: user?.id },
    });
    if (exists) {
      throw new ConflictException('Category with this name already exists');
    }

    const category = this.categoryRepository.create({
      name,
      icon: icon || '📁',
      isCustom: true,
      createdByUserId: user.id,
    });

    await this.categoryRepository.save(category);
    return category;
  }

  async updateCategoryById(
    id: string,
    updateCategorydto: UpdateCategoryDto,
    user: User,
  ): Promise<Category> {
    const category = await this.getCategoryById(id, user);
    // const { name, icon } = updateCategorydto;

    // category.name = name || category.name;
    // category.icon = icon || category.icon;
    Object.assign(category, updateCategorydto);

    await this.categoryRepository.save(category);
    return category;
  }

  async deleteCategoryById(id: string, user: User): Promise<string> {
    const category = await this.getCategoryById(id, user);

    if (!category?.isCustom) {
      throw new ForbiddenException('Default categories cannot be deleted');
    }

    if (category?.createdByUserId !== user?.id) {
      throw new ForbiddenException('Access Denied');
    }

    const result = await this.categoryRepository.delete({
      id,
      createdByUserId: user?.id,
    });

    if (result?.affected === 0) {
      throw new NotFoundException(`category with id ${id} not found`);
    }
    return 'category deleted successfully';
  }

  async seedDefaultCategories(): Promise<void> {
    const defaults = [
      { name: 'Food & Dining', icon: '🍔' },
      { name: 'Transportation', icon: '🚗' },
      { name: 'Shopping', icon: '🛍' },
      { name: 'Entertainment', icon: '🎬' },
      { name: 'Bills & Utilities', icon: '💡' },
      { name: 'Healthcare', icon: '🏥' },
      { name: 'Education', icon: '📚' },
      { name: 'Travel', icon: '✈' },
      { name: 'Personal Care', icon: '💆' },
      { name: 'Insurance', icon: '🛡' },
      { name: 'Savings', icon: '💰' },
      { name: 'Other', icon: '📦' },
    ];

    for (const categoryData of defaults) {
      const exists = await this.categoryRepository.findOne({
        where: { name: categoryData.name, isCustom: false },
      });

      if (!exists) {
        await this.categoryRepository.save({
          ...categoryData,
          isCustom: false,
          createdByUserId: null,
        });
      }
    }
  }
}
