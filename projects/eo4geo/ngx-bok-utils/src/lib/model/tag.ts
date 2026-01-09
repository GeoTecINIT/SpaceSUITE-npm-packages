export class Tag {
    label: string = '';
    variant?: Variant = 'primary';
    tooltip:string = '';
    color?: string = '';

    constructor(label: string, variant?: Variant, tooltip?: string, color?: string) {
        this.label = label;
        if(variant) this.variant = variant;
        if(tooltip) this.tooltip = tooltip;
        if(color) this.color = color;
    }
}

export type Variant = 'primary' | 'secondary' | 'bok';