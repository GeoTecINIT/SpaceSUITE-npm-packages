import {Component, EventEmitter, Input, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomD3Node } from '../../model/custom-d3-node.model';
import { ListComponent } from '../list/list.component';
import { VersionsComponent } from '../versions/versions.component';

@Component({
  standalone: true,
  selector: 'description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.css'],
  imports: [CommonModule, ListComponent, VersionsComponent],
})
export class DescriptionComponent {

  @Input() bokNode = new CustomD3Node();
  @Input() isAnOldVersion = false;
  @Input() isAnObsoleteId = false;
  @Input() showVersions = true;
  @Input() versionMap?: Map<string, number>;
  @Input() currentVersion?: string;
  @Input() bokVersion?: string;
  @Output() codSelectedChange = new EventEmitter<string>();
  @Output() bokVersionChange = new EventEmitter<string>();

  get permalink(): string {
    return `https://bok.eo4geo.eu/${this.bokNode.nameShort}`;
  }

  get statusText(): string | null {
    if (this.bokNode.selfAssesment) {
      return `Status: ${this.removeHtmlTags(this.bokNode.selfAssesment)}`;
    }
    return null;
  }

  get formattedTimestamp(): string {
    if (this.bokNode.timestamp) {
      return `Last Updated: ${new Date(this.bokNode.timestamp).toUTCString()}`;
    }
    return '';
  }

  get parentHierarchy(): any[] {
    const parents: any[] = [];
    let p = this.bokNode.parent;
    while (p) {
      parents.push(p);
      p = p.parent;
    }
    return parents.reverse();
  }

  get otherParentHierarchies(): any[][] {
    return this.bokNode.otherParents.map((op: CustomD3Node | null) => {
      const hierarchy: any[] = [];
      while (op) {
        hierarchy.push(op);
        op = op.parent;
      }
      return hierarchy.reverse();
    });
  }

  browseToConcept(nameShort: string): void {
    this.codSelectedChange.emit(nameShort);
  }

  loadOldBokVersion(version: string): void {
    this.bokVersion = version;
    this.bokVersionChange.emit(version);
  }

  private removeHtmlTags(text: string): string {
    return text.replace(/<\/?[^>]+(>|$)/g, "");
  }
}
