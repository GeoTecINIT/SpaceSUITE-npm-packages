import {Component, EventEmitter, Input, Output, Type, ViewChild, ViewContainerRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BubbleComponent } from "./bubble/bubble.component";
import { BokFirebaseService } from '../services/bok-firebase.service';
import { BokDataService } from '../services/bok-data.service';
import { ParsedBokData } from '../model/parsed-bok-data.model';
import { DescriptionComponent } from './description/description.component';
import { CustomD3Node } from '../model/custom-d3-node.model';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SearchComponent } from './search/search.component';
import { ScrollTopModule } from 'primeng/scrolltop';
import { catchError, expand, of, concatMap, takeWhile } from 'rxjs';

@Component({
  standalone: true,
  selector: 'bok-visualization',
  templateUrl: './bok.component.html',
  styleUrls: ['./bok.component.css'],
  imports: [BubbleComponent, DescriptionComponent, SearchComponent, ProgressSpinnerModule, ScrollTopModule, CommonModule],
})
export class BokComponent {
  // Custom Spinner attributes
  @Input() customSpinner!: Type<any>;
  @ViewChild('container', { read: ViewContainerRef, static: false }) container!: ViewContainerRef;

  // Bubbles & Description attributes
  @Input('selectedConcept') codSelected = 'GIST';
  @Input() showDescription = true;
  @Input() showVersions = true;
  @Input() showSearchEngine = true;
  @Output('selectedConceptChange') codSelectedChange = new EventEmitter<string>();
  public nodeSelected?: CustomD3Node;
  public bubbleData?: ParsedBokData;
  public versionMap?: Map<string, number>;
  public currentVersion?: string;
  public bokVersion?: string;
  public isAnOldVersion = false;
  public isAnObsoleteId = false;
  public loading = true;

  // Search attributes
  public selectedNodes: string[] = [];
  public searchInputFieldDoc = '';
  public searchBooleans: {
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
  public suggestions: CustomD3Node[] = [];

  //Load old concepts
  private firstLoad = true;

  constructor(private bokFirebaseService: BokFirebaseService, private bokDataService: BokDataService){}

  ngOnInit(): void {
    this.bokFirebaseService.getBokVersion('current').subscribe(
      (bok: any) => {
        this.currentVersion = 'v' + bok.version;
        this.bokVersion = this.currentVersion;
        this.bokDataService.parseBOKData(bok);
        this.loading = false;
      }
    );
    if (this.showVersions) {
      this.bokFirebaseService.getOldVersionsData().subscribe(
        (versionsMap: Map<string, number> | undefined) => {
          if (versionsMap) this.versionMap = versionsMap;
        }
      )
    }
    this.bokDataService.getParsedBokData().subscribe(
      (parsedData: ParsedBokData | undefined) => {
        this.bubbleData = parsedData
        this.onCodeSelectedChange(this.codSelected);
        if (this.firstLoad && this.codSelected != this.nodeSelected?.nameShort) {
          this.loadOldConcept();
        }
        this.firstLoad = !parsedData;
      }
    );
  }

  ngAfterViewInit() {
    if (this.customSpinner) {
      this.container.createComponent(this.customSpinner);
    }
  }

  public onCodeSelectedChange(newCodSelected: string) {
    this.codSelected = newCodSelected;
    
    // Check if the new code is obsolete
    if (this.isAnOldVersion) {
      this.bokFirebaseService.getBokVersion('current').subscribe(
        ((bok: any) => {
          this.isAnObsoleteId = !bok.concepts.some((concept: any) => concept.code === newCodSelected);
        })
      )
    } else this.isAnObsoleteId = false;

    // Search the new code bubble
    if (this.bubbleData) {
      this.nodeSelected = this.bubbleData.conceptNodeCollection.getNodeByNameShort(newCodSelected) ?? this.bubbleData.nodes;
      if (this.nodeSelected == this.bubbleData.nodes) this.isAnObsoleteId = false;
    }

    this.codSelectedChange.emit(newCodSelected);
  }

  // Version management
  public onBokversionChange(newBokVersion: string) {
    this.bokVersion = newBokVersion;
    let version = this.bokVersion;
    if (newBokVersion === this.currentVersion) {
      version = 'current';
      this.isAnOldVersion = false;
    }
    else {
      this.isAnOldVersion = true;
    }
    this.loading = true;
    this.bokFirebaseService.getBokVersion(version).subscribe(
      (bok: any) => {
        this.bokDataService.parseBOKData(bok);
        this.loading = false;
        this.searchBubbles();
      }
    );
  }

  // Load old concepts
  private loadOldConcept() {
    let checkVersion = Number(this.currentVersion?.slice(1)) - 1;
    of(checkVersion).pipe(
      expand(version => 
        version > 0 
          ? this.bokFirebaseService.checkConcept(this.codSelected, 'v' + version).pipe(
              concatMap((name: string) => {
                if (name) {
                  this.onBokversionChange('v' + version);
                  return of(0);
                }
                return of(version - 1);
              }),
              catchError(() => of(version - 1))
            )
          : of(0)
      ),
      takeWhile(version => version > 0, true)
    ).subscribe();
  }

  public onSearchValueChange(searchValue: string) {
    this.searchInputFieldDoc = searchValue.trim(); 
    this.searchBubbles();
  }

  public onSearchBooleansChange(searchBooleans: {
    searchCode: boolean;
    searchName: boolean;
    searchDescription: boolean;
    searchSkills: boolean;
  }) {
    this.searchBooleans = searchBooleans;
    this.searchBubbles();
  }

  // TODO [priority: Low] Improve the search process performance. (2025-01-16)
  private searchBubbles() {
    if (this.bubbleData) {
      if (this.searchInputFieldDoc != "" && this.searchInputFieldDoc != " ") {
        this.selectedNodes = this.bubbleData.conceptNodeCollection.getNodesIdByKeyword(
          this.searchInputFieldDoc, this.searchBooleans.searchCode, this.searchBooleans.searchName, this.searchBooleans.searchDescription, this.searchBooleans.searchSkills
        );
        this.suggestions = this.bubbleData.conceptNodeCollection.getNodesByKeyword(
          this.searchInputFieldDoc, this.searchBooleans.searchCode, this.searchBooleans.searchName, this.searchBooleans.searchDescription, this.searchBooleans.searchSkills
        );
      }
      else {
        this.selectedNodes = [];
        this.suggestions = [];
      }
    }
  }
}
