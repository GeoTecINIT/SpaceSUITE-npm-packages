import { Injectable } from '@angular/core';
import { CustomD3Node } from '../model/custom-d3-node.model';
import { CustomD3NodeCollection } from '../model/custom-d3-node-collection.model';
import { ParsedBokData } from '../model/parsed-bok-data.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BokDataService {

  private readonly Relationtype = {
    SIMILAR: 'similarTo',
    PREREQUISITE: 'prerequisites',
    POSTREQUISITE: 'postrequisites',
    BROADER: 'broader',
    NARROWER: 'narrower',
    DEMONSTRATES: 'demonstrates',
    SUBCONCEPT: 'is subconcept of',
    SIMILARTO: 'is similar to',
    PREREQUISITEOF: 'is prerequisite of',
  };

  private colorhash = {
    GI: '#cef4ff',
    IP: '#1f77b4',
    CF: '#aec7e8',
    CV: '#ff7f0e',
    DA: '#ffbb78',
    DM: '#2ca02c',
    DN: '#98df8a',
    PS: '#d62728',
    GD: '#cc5b59',
    GS: '#9467bd',
    AM: '#8c564b',
    MD: '#8c564b',
    OI: '#c49c94',
    GC: '#e377c2',
    PP: '#f7b6d2',
    SD: '#7f7f7f',
    SH: '#c7c7c7',
    TA: '#bcbd22',
    WB: '#07561e',
    GN: '#1ca8dd',
    SC: '#ffcc00',
    SA: '#ff9f4a',
    no: '#17becf',
  }

  private parsedBokData$: BehaviorSubject<ParsedBokData | undefined> = new BehaviorSubject<ParsedBokData | undefined>(undefined);

  getParsedBokData(): Observable<ParsedBokData | undefined> {
    return this.parsedBokData$;
  }

  parseBOKData(bokJSON: any): ParsedBokData {
    const allNodes: CustomD3Node[] = [];
    const namehash: Record<string, string> = {};

    // Loop all nodes
    for (let n = 0; n < bokJSON.concepts.length; n++) {
      const newNode = new CustomD3Node({
        name: bokJSON.concepts[n].name,
        nameShort: bokJSON.concepts[n].code,
        description: bokJSON.concepts[n].description,
        selfAssesment: bokJSON.concepts[n].selfAssesment,
        uri: n.toString(),
        id: n.toString(),
        children: [],
        demonstrableSkills: [],
        sourceDocuments: [],
        contributors: [],
        parent: null,
        otherParents: [],
        similarConcepts: [],
      });

      namehash[bokJSON.concepts[n].code] = newNode.name || '';
      allNodes.push(newNode);
    }

    // Handle relations
    for (const relation of bokJSON.relations) {
      const sourceNode = allNodes[relation.source];
      const targetNode = allNodes[relation.target];

      if (relation.name === this.Relationtype.SUBCONCEPT) {
        if (sourceNode.parent) {
          sourceNode.otherParents.push(targetNode);
        } else {
          sourceNode.parent = targetNode;
        }
        targetNode.children.push(sourceNode);
      }

      if (relation.name === this.Relationtype.SIMILARTO) {
        targetNode.similarConcepts.push(sourceNode);
        sourceNode.similarConcepts.push(targetNode);
      }

      if (relation.name === this.Relationtype.PREREQUISITEOF) {
        targetNode.prerequisites.push(sourceNode);
      }
    }

    // Handle skills
    for (const skill of bokJSON.skills) {
      for (const conceptIndex of skill.concepts) {
        const node = allNodes[conceptIndex];
        node.demonstrableSkills.push({
          name: skill.name,
          bloomLevel: skill.bloomLevel,
          bloomVerb: skill.bloomVerb,
        });
      }
    }

    // Handle references
    for (const reference of bokJSON.references) {
      for (const conceptIndex of reference.concepts) {
        const node = allNodes[conceptIndex];
        node.sourceDocuments.push({
          description: reference.description,
          nameShort: reference.name,
          url: reference.url,
        });
      }
    }

    // Handle contributors
    if (Array.isArray(bokJSON.contributors)) {
      for (const contributor of bokJSON.contributors) {
        for (const conceptIndex of contributor.concepts) {
          const node = allNodes[conceptIndex];
          node.contributors.push({
            description: contributor.description,
            nameShort: contributor.name,
            url: contributor.url,
          });
          node.contributors.sort((a, b) => a.nameShort.localeCompare(b.nameShort));
        }
      }
    }

    // Create and return the collection
    const conceptNodeCollection = new CustomD3NodeCollection();
    for (const node of allNodes) {
      conceptNodeCollection.add(node);
    }

    const parsedData = new ParsedBokData({
      nodes: allNodes[0],
      relations: bokJSON.relations,
      namehash,
      conceptNodeCollection,
      colors: this.colorhash,
    });

    this.parsedBokData$.next(parsedData);

    return parsedData;
  }
}
