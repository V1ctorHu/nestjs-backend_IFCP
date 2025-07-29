import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  NotFoundException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly CategoriesService: CategoriesService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.CategoriesService.create(createCategoryDto);
  }

  @Get()
  async findAll() {
    return await this.CategoriesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.CategoriesService.findOne(id);
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: number) {
    const category = await this.CategoriesService.findOne(id);
    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return category;
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.CategoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.CategoriesService.remove(id);
  }
}
