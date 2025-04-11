import {Component, EventEmitter, Input, Output} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'versions',
  templateUrl: './versions.component.html',
  styleUrls: ['./versions.component.css'],
  imports: [CommonModule],
})
export class VersionsComponent {
  @Input() currentVersion = '';
  @Input() bokVersion = '';
  @Input() bokVersions = new Map<string, number>();
  @Output() bokVersionChange = new EventEmitter<string>();

  readonly descendingOrder = (a: any, b: any) => b.value - a.value;

  loadOldBokVersion(version: string): void {
    this.bokVersionChange.emit(version);
  }
}
