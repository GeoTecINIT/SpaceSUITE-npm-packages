import {Component, EventEmitter, Output} from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  standalone: true,
  selector: 'footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  imports: [ToolbarModule],
})
export class FooterComponent {
  @Output() openReleaseNotes = new EventEmitter<void>();
  @Output() openUserManual = new EventEmitter<void>();


  clickReleaseNotes(): void {
    this.openReleaseNotes.emit();
  }

  clickUserManual(): void {
    this.openUserManual.emit();
  }
}
