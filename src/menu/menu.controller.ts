import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
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
}
