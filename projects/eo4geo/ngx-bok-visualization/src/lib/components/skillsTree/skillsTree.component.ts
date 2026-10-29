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

  private placeholderData = [
  {
    "name": "Recognize Geospatial Data types, including primary sources like remote sensing imagery and secondary sources like scanned analog maps.",
    "bloomLevel": 1,
    "bloomVerb": "Recognizing"
  },
  {
    "name": "Recall Geospatial Data core properties, including spatial autocorrelation and the inherent geometric complexity of the Earth's surface.",
    "bloomLevel": 1,
    "bloomVerb": "Recalling"
  },
  {
    "name": "Interpret Geospatial Data by translating raw measurements of locations and attributes into meaningful spatial information for environmental questions.",
    "bloomLevel": 2,
    "bloomVerb": "Interpreting"
  },
  {
    "name": "Exemplify Geospatial Data sources using police traffic crash reports, environmental monitoring station logs, and satellite imagery datasets.",
    "bloomLevel": 2,
    "bloomVerb": "Exemplifying"
  },
  {
    "name": "Classify Geospatial Data into primary field surveys and secondary digitized datasets containing spatial, temporal, and attribute components.",
    "bloomLevel": 2,
    "bloomVerb": "Classifying"
  },
  {
    "name": "Summarize Geospatial Data characteristics, including data currency, information value, metadata presence, and collection costs.",
    "bloomLevel": 2,
    "bloomVerb": "Summarizing"
  },
  {
    "name": "Infer Geospatial Data quality from metadata, including potential tracking errors and positional uncertainty in historical datasets.",
    "bloomLevel": 2,
    "bloomVerb": "Inferring"
  },
  {
    "name": "Compare Geospatial Data properties across different eras, contrasting legacy expert-produced data with modern web-based geographic information clearinghouses.",
    "bloomLevel": 2,
    "bloomVerb": "Comparing"
  },
  {
    "name": "Explain Geospatial Data workflows and how analytical methods transform raw measurements into information for government planning agencies.",
    "bloomLevel": 2,
    "bloomVerb": "Explaining"
  },
  {
    "name": "Execute Geospatial Data processing tasks by cleaning raw surveying measurements and appending descriptive attributes to localized spatial points.",
    "bloomLevel": 3,
    "bloomVerb": "Executing"
  },
  {
    "name": "Implement Geospatial Data collection procedures using GPS tracking and field surveys to systematically gather localized attribute and temporal data.",
    "bloomLevel": 3,
    "bloomVerb": "Implementing"
  },
  {
    "name": "Differentiate Geospatial Data elements by distinguishing spatial coordinates, temporal markers, and descriptive attributes in geographic data models.",
    "bloomLevel": 4,
    "bloomVerb": "Differentiating"
  },
  {
    "name": "Organize Geospatial Data sets by arranging primary surveying points and secondary scanned maps within an established spatial data infrastructure framework.",
    "bloomLevel": 4,
    "bloomVerb": "Organizing"
  },
  {
    "name": "Attribute Geospatial Data point biases to commercial or proprietary interests influencing primary data acquisition methods.",
    "bloomLevel": 4,
    "bloomVerb": "Attributing"
  },
  {
    "name": "Check Geospatial Data integrity by testing file structures against data quality standards and identifying inconsistencies in scale, attributes, or temporal components.",
    "bloomLevel": 5,
    "bloomVerb": "Checking"
  },
  {
    "name": "Critique Geospatial Data quality by evaluating fitness for process modeling based on currency, resolution errors, and gaps in historical data.",
    "bloomLevel": 5,
    "bloomVerb": "Critiquing"
  },
  {
    "name": "Generate Geospatial Data hypotheses by exploring spatial autocorrelation and predicting interactions among location-based phenomena across geographical extents.",
    "bloomLevel": 6,
    "bloomVerb": "Generating"
  },
  {
    "name": "Plan Geospatial Data acquisition frameworks by designing collection strategies that balance surveying costs with web-based data clearinghouse options.",
    "bloomLevel": 6,
    "bloomVerb": "Planning"
  },
  {
    "name": "Produce Geospatial Data schemas by combining spatial, temporal, and descriptive attributes with comprehensive metadata in a coherent database.",
    "bloomLevel": 6,
    "bloomVerb": "Producing"
  }];

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
    ];

    this.placeholderData.forEach(element => {
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
