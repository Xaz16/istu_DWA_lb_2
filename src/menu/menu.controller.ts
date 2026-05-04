import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ListDishesQueryDto } from './dto/list-dishes-query.dto';
import { MenuService } from './menu.service';

@Controller()
export class MenuController {
  constructor(private readonly menu: MenuService) {}

  @Get('sections')
  listSections() {
    return this.menu.listSections();
  }

  @Get('dishes')
  listDishes(@Query() query: ListDishesQueryDto) {
    return this.menu.findDishes(query);
  }

  @Get('dishes/:id')
  getDishById(@Param('id', ParseIntPipe) id: number) {
    return this.menu.findDishById(id);
  }

  @Post('dishes/:id/reviews')
  @HttpCode(HttpStatus.CREATED)
  createReview(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateReviewDto) {
    return this.menu.createReview(id, dto);
  }

  @Post('dishes/:id/reviews/:reviewId/like')
  @HttpCode(HttpStatus.CREATED)
  createLike(@Param('id', ParseIntPipe) id: number, @Param('reviewId', ParseIntPipe) reviewID: number) {
    return this.menu.createLike(reviewID);
  }
}
