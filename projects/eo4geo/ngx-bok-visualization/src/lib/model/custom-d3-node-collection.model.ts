import { CustomD3Node } from "./custom-d3-node.model";

export class CustomD3NodeCollection {
    nodes: CustomD3Node[] = [];
  
    add(node: CustomD3Node): void {
      this.nodes.push(node);
    }
  
    pop(): CustomD3Node | undefined {
      return this.nodes.pop();
    }
  
    getNodeByURI(uri: string): CustomD3Node | null {
      return this.nodes.find(node => node.id?.split("_rev")[0] === uri) || null;
    }
  
    getNodeByNameShort(nameShort: string): CustomD3Node | null {
      return this.nodes.find(node => node.nameShort === nameShort) || null;
    }
  
    getNodesByKeyword(
      keyword: string,
      searchCode: boolean = true,
      searchName: boolean = true,
      searchDes: boolean = true,
      searchSkills: boolean = true
    ): CustomD3Node[] {
      const result: CustomD3Node[] = [];
      const upperKeyword = keyword.toUpperCase();
  
      if (searchCode) {
        this.nodes.forEach(node => {
          if (node.nameShort.toUpperCase().includes(upperKeyword) && !result.includes(node)) {
            result.push(node);
          }
        });
      }
  
      if (searchName) {
        this.nodes.forEach(node => {
          if (node.name && node.name.toUpperCase().includes(upperKeyword) && !result.includes(node)) {
            result.push(node);
          }
        });
      }
  
      if (searchSkills) {
        this.nodes.forEach(node => {
          if (Array.isArray(node.demonstrableSkills)) {
            node.demonstrableSkills.forEach(skill => {
              if (skill.name.toUpperCase().includes(upperKeyword) && !result.includes(node)) {
                result.push(node);
              }
            });
          }
        });
      }
  
      if (searchDes) {
        this.nodes.forEach(node => {
          if (node.description && node.description.toUpperCase().includes(upperKeyword) && !result.includes(node)) {
            result.push(node);
          }
        });
      }
  
      return result;
    }
  
    getNodesIdByKeyword(
      keyword: string,
      searchCode: boolean = true,
      searchName: boolean = true,
      searchDes: boolean = true,
      searchSkills: boolean = true
    ): string[] {
      const result: string[] = [];
      const upperKeyword = keyword.toUpperCase();
  
      if (searchCode) {
        this.nodes.forEach(node => {
          if (node.nameShort.toUpperCase().includes(upperKeyword) && node.id && !result.includes(node.id)) {
            result.push(node.id);
          }
        });
      }
  
      if (searchName) {
        this.nodes.forEach(node => {
          if (node.name && node.name.toUpperCase().includes(upperKeyword) && node.id && !result.includes(node.id)) {
            result.push(node.id);
          }
        });
      }
  
      if (searchSkills) {
        this.nodes.forEach(node => {
          if (Array.isArray(node.demonstrableSkills)) {
            node.demonstrableSkills.forEach(skill => {
              if (skill.name.toUpperCase().includes(upperKeyword) && node.id && !result.includes(node.id)) {
                result.push(node.id);
              }
            });
          }
        });
      }
  
      if (searchDes) {
        this.nodes.forEach(node => {
          if (node.description && node.description.toUpperCase().includes(upperKeyword) && node.id && !result.includes(node.id)) {
            result.push(node.id);
          }
        });
      }
  
      return result;
    }
  }
  