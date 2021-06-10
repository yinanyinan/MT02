import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'category' })
export class CategoryPipe implements PipeTransform {


  transform(value, array: Array) {

    for (let i = 0; i < array.length; i++) {
      if (array[i].value == value) {
        return array[i].label;
      }
    }
  }

}

