import { Injectable } from "@angular/core";
import { BokDataService } from "./bok-data.service";
import { BokFirebaseService } from "./bok-firebase.service";
import { ParsedBokData } from "../model/parsed-bok-data.model";
import { filter, Observable, map } from "rxjs";
import { CustomD3Node } from "../model/custom-d3-node.model";

@Injectable({
  providedIn: 'root',
})
export class BokInformationService {
    
  constructor(private bokDataService: BokDataService, private bokFirebaseService: BokFirebaseService) {
    this.bokFirebaseService.getBokVersion('current').subscribe(
      (bok: any) => {
        this.bokDataService.parseBOKData(bok);
      }
    );
  }

  getConceptColor(code: string): Observable<string> {
    let knowledgeAreaCode = code.slice(0, 2);
    return this.bokDataService.getParsedBokData().pipe(
      filter((parsedData): parsedData is ParsedBokData => parsedData !== undefined),
      map((parsedData: ParsedBokData) => parsedData.colors[knowledgeAreaCode])
    );
  }
  
  getConceptName(code: string): Observable<string> {
    return this.bokDataService.getParsedBokData().pipe(
      filter((parsedData): parsedData is ParsedBokData => parsedData !== undefined),
      map((parsedData: ParsedBokData) => parsedData.namehash[code])
    );
  }

  getKnowledgeAreas(code: string): Observable<string[]> {
    return this.bokDataService.getParsedBokData().pipe(
      filter((parsedData): parsedData is ParsedBokData => parsedData !== undefined),
      map((parsedData: ParsedBokData) => {
        let currentNode = parsedData.conceptNodeCollection.getNodeByNameShort(code);
        if (!currentNode) return [];
        if (currentNode?.nameShort == 'GIST') return [currentNode.nameShort];
        let knowledgeAreas: Set<string> = new Set();
        return Array.from(this.checkParents(currentNode, knowledgeAreas));
      })
    );
  }

  getConceptSkills(code: string): Observable<string[]> {
    return this.bokDataService.getParsedBokData().pipe(
      filter((parsedData): parsedData is ParsedBokData => parsedData !== undefined),
      map((parsedData: ParsedBokData) => {
        const skills = parsedData.conceptNodeCollection.getNodeByNameShort(code)?.demonstrableSkills || [];
        return skills.map(value => value.description);
      })
    );
  }

  private checkParents(node: CustomD3Node, knowledgeAreas: Set<string>): Set<string> {
    let superiorNodes = [...node.otherParents];
    if (node.parent) superiorNodes.push(node.parent);
    let newKnowledgeAreas = new Set(knowledgeAreas);
    superiorNodes.forEach(
      superiorNode => {
        if (superiorNode.nameShort == 'GIST') {
          newKnowledgeAreas.add(node.nameShort)
        } else {
          newKnowledgeAreas = new Set([...newKnowledgeAreas, ...this.checkParents(superiorNode, knowledgeAreas)]);
        }
      }
    )
    return newKnowledgeAreas;
  }
}