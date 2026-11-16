import {Component, Input, WritableSignal, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from "primeng/api";

@Component({
  standalone: true,
  selector: 'skillsTree',
  templateUrl: './skillsTree.component.html',
  styleUrls: ['./skillsTree.component.css'],
  imports: [CommonModule, TreeModule],
})
export class SkillsTreeComponent {
  @Input() array: { name: string; bloomLevel: number; bloomVerb: string }[] = [];
  @Input() headline: string = '';

  public formattedTree: WritableSignal<TreeNode[]> = signal([])

  ngOnInit() {
    const tempTree: TreeNode[] = [
      {
        key: '1',
        label: 'Level 1: Remember',
        children: [],
        leaf: false,
        expanded: false,
      },
      {
        key: '2',
        label: 'Level 2: Understand',
        children: [],
        leaf: false,
        expanded: false,
      },
      {
        key: '3',
        label: 'Level 3: Apply',
        children: [],
        leaf: false,
        expanded: false,
      },
      {
        key: '4',
        label: 'Level 4: Analyze',
        children: [],
        leaf: false,
        expanded: false,
      },
      {
        key: '5',
        label: 'Level 5: Evaluate',
        children: [],
        leaf: false,
        expanded: false,
      },
      {
        key: '6',
        label: 'Level 6: Create',
        children: [],
        leaf: false,
        expanded: false,
      },
      {
        key: '0',
        label: 'Unclassified Skills',
        children: [],
        leaf: false,
        expanded: false,
      },
    ];

    this.array.forEach(element => {
      const levelNode: TreeNode = tempTree[element.bloomLevel - 1];
      if (!levelNode) return
      levelNode.children ??= [];
      levelNode.children.push({
        key: `${element.bloomLevel}-${element.bloomVerb}-${levelNode.children.length}`,
        label: element.name,
        children: [],
        leaf: true,
        expanded: false,
        type: 'leaf',
        data: element.bloomVerb 
      });
    });

    tempTree.forEach(levelNode => {
      levelNode.children = this.getSortedArray(levelNode.children ?? []);
    })
    this.formattedTree.set(tempTree);
  }

  private getSortedArray(values: TreeNode[]) {
    if (values.length > 0) {
      return [...values].sort((a, b) =>
        this.compareStrings(a.label ?? '', b.label ?? '')
      );
    }
    return values;
  }

  public countChildren(node: TreeNode): number {
    let count = 0;
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => count += this.countChildren(child));
    }
    else count += 1;
    return count;
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
