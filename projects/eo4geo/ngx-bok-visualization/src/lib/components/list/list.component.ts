import {Component, EventEmitter, Input, Output} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  imports: [CommonModule],
})
export class ListComponent {
  @Input() array: any[] = [];
  @Input() propertyname?: string;
  @Input() propertyname2?: string;
  @Input() headline: string = '';
  @Input() isConcept: boolean = false;
  @Output() codSelectedChange = new EventEmitter<string>();
  

  get sortedArray() {
    const property = this.propertyname2 == 'nameShort' ? this.propertyname2 : this.propertyname;
  
    if (this.array.length > 0 && this.array[0][property!]) {
      return [...this.array].sort((a, b) =>
        this.compareStrings(a[property!], b[property!])
      );
    }
  
    return this.array;
  }
  
  mapValue(item: any): string {
    let value = this.propertyname ? item[this.propertyname] : item;
    return value;
  }

  browseToConcept(nameShort: string): void {
    this.codSelectedChange.emit(nameShort);
  }

  private compareStrings = (a: string, b: string) => {
    const partsA = a.split('-');
    const partsB = b.split('-');
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const partA = partsA[i];
      const partB = partsB[i];
      if (!isNaN(Number(partA)) && !isNaN(Number(partB))) {
        const numA = parseInt(partA, 10);
        const numB = parseInt(partB, 10);
        if (numA !== numB) return numA - numB;
      } else {
        const result = (partA || "").localeCompare(partB || "");
        if (result !== 0) return result;
      }
    }
    return 0;
  }
  
}
