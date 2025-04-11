import { CustomD3NodeCollection } from "./custom-d3-node-collection.model";
import { CustomD3Node } from "./custom-d3-node.model";

export class ParsedBokData {
    nodes = new CustomD3Node(); // Root node
    relations: { name: string; source: number; target: number }[] = [];
    namehash: { [key: string]: string } = {};
    conceptNodeCollection = new CustomD3NodeCollection();
    colors: { [key: string]: string } = {};
  
    constructor(init?: Partial<ParsedBokData>) {
      Object.assign(this, init);
    }
  }