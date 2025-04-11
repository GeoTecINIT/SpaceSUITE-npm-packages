import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
    transform(value: string, searchWord: string, margin: number): string {
        const limitStart = value.toUpperCase().indexOf(searchWord.toUpperCase());
        const truncateString = limitStart > margin;
        if (limitStart >= 0) {
            let newValue = '';
            if (truncateString) newValue += '...' + value.substring(limitStart - margin, limitStart);
            else newValue += value.substring(0, limitStart);
            newValue += '<b>' + value.substring(limitStart, limitStart + searchWord.length) + '</b>' + value.substring(limitStart + searchWord.length, limitStart + value.length);
            return newValue;
        }
        return value;
    }
}