import {Component, EventEmitter, Input, Output, SimpleChanges} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { CheckboxModule } from 'primeng/checkbox';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CustomD3Node } from '../../model/custom-d3-node.model';
import { SearchResultsComponent } from '../searchResults/searchResults.component';

@Component({
  standalone: true,
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  imports: [InputTextModule, FloatLabel, 
            FormsModule, CheckboxModule, 
            DrawerModule, ButtonModule, 
            DividerModule, SearchResultsComponent],
})
export class SearchComponent {
  @Input() inputValue: string = '';
  @Input() searchBooleans: {
    searchCode: boolean,
    searchName: boolean,
    searchDescription: boolean,
    searchSkills: boolean,
  } = {
    searchCode: true,
    searchName: true,
    searchDescription: true,
    searchSkills: false,
  };
  @Input({alias: 'suggestions'}) nodeSuggestions: CustomD3Node[] = []
  @Output() inputValueChange = new EventEmitter<string>();
  @Output() searchSettingsChange = new EventEmitter<{
    searchCode: boolean;
    searchName: boolean;
    searchDescription: boolean;
    searchSkills: boolean;
  }>();
  @Output() codSelectedChange = new EventEmitter<string>();
  public visible: boolean = false;

  isMobile: boolean = false;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver.observe(['(max-width: 992px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['inputValue'] && changes['inputValue'].previousValue != changes['inputValue'].currentValue) this.onInputValueChange(changes['inputValue'].currentValue);
    if (changes['searchBooleans'] && changes['searchBooleans'].previousValue != changes['searchBooleans'].currentValue) this.updateSearchSettings();
  }

  onInputValueChange(value: any): void {
    this.inputValue = value;
    this.inputValueChange.emit(this.inputValue);
  }

  updateSearchSettings(): void {
    this.searchSettingsChange.emit(this.searchBooleans);
  }

  onCodSelectedChange(value: string): void {
    this.codSelectedChange.emit(value);
    this.visible = false;
  }
}
