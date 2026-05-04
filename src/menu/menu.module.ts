import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dish } from '../database/entities/dish.entity';
import { MenuSection } from '../database/entities/menu-section.entity';
import { Review } from '../database/entities/review.entity';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';

@Module({
  imports: [TypeOrmModule.forFeature([MenuSection, Dish, Review])],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
