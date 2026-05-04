import { IsVisitDate } from '../../common/validators/is-visit-date.decorator';

export class HallTablesQueryDto {
  @IsVisitDate()
  visitDate!: string;
}
