import { CommonModule } from '@angular/common';
import {Component, ElementRef, EventEmitter, Input, NgZone, Output, ViewChild} from '@angular/core';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Tag } from '../../model/tag';

@Component({
  standalone: true,
  selector: 'skill-tags',
  templateUrl: './skillTags.component.html',
  styleUrls: ['./skillTags.component.css'],
  imports: [CommonModule, TagModule, TooltipModule],
})
export class SkillTagComponent {
  @Input() tags: Tag[] = [];
  @Input() direction: Direction = 'original';
  @Input() compactBoKTags: boolean = true;
  @Input() compactThreshold: number = 400;
  overflowTags: boolean = false;

  @ViewChild('bokDiv', { static: false }) bokDiv!: ElementRef<HTMLDivElement>;

  resizeObserver!: ResizeObserver;

  @Output() layoutUpdated : EventEmitter<void> = new EventEmitter();

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit() {
    this.resizeObserver = new ResizeObserver(() => this.checkOverflow());
    this.resizeObserver.observe(this.bokDiv.nativeElement);
    this.checkOverflow();
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  checkOverflow() {
    if (!this.compactBoKTags) return;

    this.ngZone.run(() => {
      const elWidth = this.bokDiv.nativeElement.offsetWidth;
      let isOverflowing = elWidth < this.compactThreshold;

      if (this.overflowTags !== isOverflowing) {
        this.overflowTags = isOverflowing;
        requestAnimationFrame(() => {
          this.layoutUpdated.emit();
        });
      }
    });
  }

  getBokColor(color: string): string {
    return this.convertHexToRgba(color, 0.5);
  }

  getTooltipClass(tag: Tag): string {
    return tag.tooltip == 'Unknown Concept' ? 'custom-p-tooltip-text' : '';
  }

  onClickConcept(code: string) {
    window.open('https://bok.eo4geo.eu/' + code);
  }

  getStyleClass() {
    switch(this.direction){
      case 'original':
        return 'flex flex-wrap gap-2';
      case 'center':
        return 'flex flex-wrap gap-2 align-items-center justify-content-center';
      case 'reverse':
        return 'flex flex-wrap gap-2 flex-row-reverse';
      case 'homepage':
        return 'flex flex-wrap gap-3 align-items-center justify-content-center';
    }
  }

  private convertHexToRgba(hex: string, alpha: number): string {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

export type Direction = 'original' | 'center' | 'reverse' | 'homepage';