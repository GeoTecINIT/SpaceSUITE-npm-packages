export class CustomD3Node {
    id: string | null = null;
    name: string | null = null;
    nameShort: string = "";
    description: string = "";
    selfAssesment: string | null = null;
    size: number = 100;
    parent: CustomD3Node | null = null;
    otherParents: CustomD3Node[] = [];
    additionalParents: CustomD3Node[] = [];
    children: CustomD3Node[] = [];
    prerequisites: CustomD3Node[] = [];
    postrequisites: CustomD3Node[] = [];
    similarConcepts: CustomD3Node[] = [];
    demonstrableSkills: { description: string; nameShort: string; uri: string }[] = [];
    sourceDocuments: { description: string; nameShort: string; url: string }[] = [];
    contributors: { description: string; nameShort: string; url: string }[] = [];
    uri: string = "";
    timestamp: string = "";
  
    constructor(init?: Partial<CustomD3Node>) {
      Object.assign(this, init);
    }
  }
  
  