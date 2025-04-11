import {Component, EventEmitter, Input, Output, SimpleChanges} from '@angular/core';
import { ParsedBokData } from '../../model/parsed-bok-data.model';
import { BaseType, select, Selection } from 'd3-selection';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { hierarchy, HierarchyCircularNode, pack as d3Pack } from 'd3-hierarchy';
import { interpolateHcl, interpolateZoom, ZoomView } from 'd3-interpolate';
import { transition as d3Transition } from 'd3-transition';
import { CustomD3Node } from '../../model/custom-d3-node.model';
import { schemeCategory10 } from 'd3';

@Component({
  standalone: true,
  selector: 'bubble',
  templateUrl: './bubble.component.html',
  styleUrls: ['./bubble.component.css'],
  imports: [],
})
export class BubbleComponent {
  @Input() bokData = new ParsedBokData();
  @Input() COLOR_STROKE_SELECTED = "black";
  @Input() margin = 5;
  @Input() codSelected = 'GIST';
  @Input() selectedNodes: string[] = [];
  @Output() codSelectedChange = new EventEmitter<string>();
  public svgId = 'bubble';
  private diameter = 0;
  private node?: Selection<BaseType, HierarchyCircularNode<CustomD3Node>, SVGGElement, unknown>;
  private circle?: Selection<SVGCircleElement, HierarchyCircularNode<CustomD3Node>, SVGGElement, unknown>;
  private nodes: HierarchyCircularNode<CustomD3Node>[] = [];
  private focus?: HierarchyCircularNode<CustomD3Node>;
  private view: ZoomView = [0, 0, 1];
  private clickedNode?: HierarchyCircularNode<CustomD3Node>;

  ngOnInit(): void {
    this.createChart();
    this.highlightSearch();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Reload chart when configurations change
    if ((changes['bokData'] && !changes['bokData'].isFirstChange()) || 
        (changes['COLOR_STROKE_SELECTED'] && !changes['COLOR_STROKE_SELECTED'].isFirstChange()) || 
        (changes['margin'] && !changes['margin'].isFirstChange())) {
      select(this.svgId).select('svg').remove();
      this.createChart();
    }
    // Zoom to the new concept
    if(changes['codSelected'] && !changes['codSelected'].isFirstChange()){
      const currentValue = changes['codSelected'].currentValue;
      const isSameNode = this.clickedNode?.data.nameShort === currentValue;
      const newNode = isSameNode ? this.clickedNode : this.searchHierarchyCircularNode(currentValue);
      if (newNode) {
        this.zoom(null, newNode);
      }
    }
    // Highlight search
    if(changes['selectedNodes'] && !changes['selectedNodes'].isFirstChange()){
      this.cleanSearch(changes['selectedNodes'].previousValue);
      this.highlightSearch();
    }
  }    

  private createChart(): void {
    const svg = select(this.svgId)
      .append('svg')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', '0 0 300 300')
      .classed('svg-content', true);

    this.diameter = Number(svg.node()?.getAttribute('viewBox')?.split(' ')[2]);
    const g = svg.append('g')
      .attr('transform', `translate(${this.diameter / 2}, ${this.diameter / 2})`);

    const color = scaleLinear<string>()
    .domain([-1, 5])
    .interpolate(interpolateHcl)
    .range(['hsl(152,80%,80%)', 'hsl(228,30%,40%)']);

    const pack = d3Pack<CustomD3Node>()
      .size([this.diameter - this.margin, this.diameter - this.margin])
      .padding(2);

    let root = pack(hierarchy(this.bokData.nodes)
      .sum(function (d) {
        return d.size;
      })
      .sort(function (a, b) {
        return b.value! - a.value!;
      }));
      
    this.focus = root;
  
    this.nodes = root.descendants();
    
    let colorPalette = scaleOrdinal(schemeCategory10);

    const that = this;

    this.circle = g.selectAll("circle")
    .data(this.nodes)
    .enter().append("circle")
    .attr("r", (d) => d.r)
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y)
    .attr("id", (d) => d.data.id)
    .attr("class", (d) => {
      return d.parent ? (d.children ? "node" : "node node--leaf") : "node node--root";
    })
    .style("fill", (d) => {
      if (d.depth == 1) {
        return this.bokData.colors[d.data.nameShort.substring(0, 2)] ? this.bokData.colors[d.data.nameShort.substring(0, 2)] : this.bokData.colors['no'];
      } else if (d.depth == 2) {
        return this.bokData.colors[d.parent?.data?.nameShort?.substring(0, 2) ?? 'no'];
      } else if (d.depth == 3) {
        return this.bokData.colors[d.parent?.data?.nameShort?.substring(0, 2) ?? 'no'];
      } else if (d.depth >= 4) {
        return this.bokData.colors[d.parent?.parent?.parent?.data?.nameShort?.substring(0, 2) ?? 'no'];
      } else {
        return "#cef4ff";
      }
    })
    .style("fill-opacity", (d) => {
      if (d.depth >= 1) {
        return "0.5";
      } else {
        return "1";
      }
    })
    .attr("stroke", "black")
    .attr("stroke-width", "0.2px")
    .on("click", (event, d) => {
      if (this.focus !== d) {
        this.codSelectedChange.emit(d.data.nameShort)
        this.clickedNode = d;
      }
      event.stopPropagation();
    })
    .on("mouseover", function (d) {
      const circleElement = select(this);
      if (circleElement.style("stroke") !== that.COLOR_STROKE_SELECTED) {
        circleElement.style("stroke-width", "0.5");
      }
    })
    .on("mouseleave", function (d) {
      const circleElement = select(this);
      if (circleElement.style("stroke") !== that.COLOR_STROKE_SELECTED) {
        circleElement.style("stroke-width", "0.2");
      }
    });
  
    let text = g.selectAll("text").data(this.nodes).enter().append("text").attr("class", "label").style("pointer-events", "none").style("fill-opacity", function (d) {
      return d.parent === root || (d === root && d.children == null) ? 1 : 0;
    })
      .style("display", function (d) {
        return d.parent === root || (d === root && d.children == null) ? "inline" : "none";
      })
      .style("font-size", function (d) {
        var textLengthFactor = Math.min(1, 35 / (d.data?.name?.length ?? 1));
        return (6 * textLengthFactor) + "px";
      })
      .each(function (d) { //This function inserts a label and adds linebreaks, avoiding lines > 13 characters
        var arr = d.data?.name?.split(" ") ?? "";
        var arr2 = [];
        arr2[0] = arr[0];
        var maxLabelLength = 13;
        for (var i = 1, j = 0; i < arr.length; i++) {
          if (arr2[j].length + arr[i].length < maxLabelLength)
            arr2[j] += " " + arr[i];
          else {
            j++;
            arr2[j] = arr[i];
          }
        }
        for (var i = 0; i < arr2.length; i++) {
          select(this).append("tspan").text(arr2[i]).attr("dy", i ? "1em" : (-0.5 * (j - 1)) + "em").attr("x", 0).attr("text-anchor", "middle").attr("class", "tspan" + i);
        }
      });

    this.node = g.selectAll("circle,text");

    svg
    .style("background", "transparent")
    .on("click", (event) => {
      this.codSelectedChange.emit(root.data.nameShort)
      this.clickedNode = root;
    });

    this.zoomTo([root.x, root.y, root.r * 2 + this.margin]);

    if (this.codSelected != root.data.nameShort) { 
      let newNode = this.searchHierarchyCircularNode(this.codSelected);
      if (newNode) this.zoom(null, newNode);
    }
  }

  private zoom(event: any, d: HierarchyCircularNode<CustomD3Node>) {
    let focus0 = this.focus;
    this.focus = d;

    let transition = d3Transition()
      .duration(event && event.altKey ? 7500 : 750)
      .tween("zoom", () => {
        let i = interpolateZoom(this.view, [this.focus?.x ?? 0, this.focus?.y ?? 0, (this.focus?.r ?? 0) * 2 + this.margin]);
        return (t: number) => {
          this.zoomTo(i(t));
        };
      });
    
    let that = this;

    transition.selectAll("text")
      .filter(function (d: any) {
        return d.parent === that.focus || select(this).style("display") === "inline" || (d === that.focus && (d.children == null || d.children.length === 0));
      })
      .style("fill-opacity", (d: any) => {
        return d.parent === this.focus || (d === this.focus && (d.children == null || d.children.length === 0)) ? 1 : 0;
      })
      .on("start", function (d: any) {
        if (d.parent === that.focus || (d === that.focus && (d.children == null || d.children.length === 0))) {
          select(this).style("display", "inline");
        }
      })
      .on("end", function (d: any) {
        if (d.parent !== that.focus && (d !== that.focus && (d.children == null || d.children.length === 0))) {
          select(this).style("display", "none");  // Correcto: usa select() para modificar los estilos
        }
      });
  }



  private zoomTo(v: ZoomView) {
    var k = this.diameter / v[2];
    this.view = v;
    this.node?.attr("transform", function (d) {
      return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
    });
    this.circle?.attr("r", function (d) {
      return d.r * k;
    });
  }

  private searchHierarchyCircularNode(code: string): HierarchyCircularNode<CustomD3Node> | undefined {
    let newNode: HierarchyCircularNode<CustomD3Node> | undefined = undefined;
    for (let n of this.nodes) {
      if(n.data.nameShort == code) {
        newNode = n;
        break;
      }
    }
    return newNode;
  }

  // Clean old selection
  private cleanSearch(previousValues: string[]) {
    for (let i = 0; i < previousValues.length; i++) {
      let circle = document.getElementById(previousValues[i]);
      if (circle != null) {
        circle.style.stroke = "";
        circle.style.strokeWidth = "";
      }
    }
  }

  // Highlight new selection
  private highlightSearch() {
    for (let i = 0; i < this.selectedNodes.length; i++) {
      let circle = document.getElementById(this.selectedNodes[i]);
      if (circle != null) {
        circle.style.stroke = this.COLOR_STROKE_SELECTED;
        circle.style.strokeWidth = "0.5px";
      }
    }
  }
}
