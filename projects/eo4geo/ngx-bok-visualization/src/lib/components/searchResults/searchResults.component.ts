import {Component, EventEmitter, Input, Output, SimpleChanges} from '@angular/core';
import { CustomD3Node } from '../../model/custom-d3-node.model';
import { CommonModule } from '@angular/common';
import { DataView } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { TruncatePipe } from "../../pipes/truncate.pipe";

@Component({
  standalone: true,
  selector: 'searchResults',
  templateUrl: './searchResults.component.html',
  styleUrls: ['./searchResults.component.css'],
  imports: [DataView, CommonModule, ButtonModule, TruncatePipe],
})
export class SearchResultsComponent {
  @Input({alias: 'suggestions'}) nodeSuggestions: CustomD3Node[] = []
  @Input() searchValue = '';
  @Input() highlightDescription = false;
  @Output() codSelectedChange = new EventEmitter<string>();
}
