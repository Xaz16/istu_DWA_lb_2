import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { isValidCalendarDateString, visitDateNotInPastString } from '../visit-date';

@ValidatorConstraint({ name: 'isVisitDate', async: false })
export class IsVisitDateConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === 'string' && isValidCalendarDateString(value) && visitDateNotInPastString(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid YYYY-MM-DD and not in the past`;
  }
}

export function IsVisitDate(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsVisitDateConstraint,
    });
  };
}
