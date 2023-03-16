import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'precision'})
export class PrecisionPipe implements PipeTransform {
  transform(value: number, precision = 1) {
    return value.toFixed(precision);
  }
}