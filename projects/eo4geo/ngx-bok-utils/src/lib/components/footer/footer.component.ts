import { CommonModule } from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  standalone: true,
  selector: 'footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  imports: [ToolbarModule, CommonModule],
})
export class FooterComponent {
  @Output() openReleaseNotes = new EventEmitter<void>();
  @Output() openUserManual = new EventEmitter<void>();
  @Input() copyright: boolean = false;
  @Output() openCopyright = new EventEmitter<void>();


  clickReleaseNotes(): void {
    this.openReleaseNotes.emit();
  }

  clickUserManual(): void {
    this.openUserManual.emit();
  }

  clickCopyright(): void {
    this.openCopyright.emit()
  }
}
