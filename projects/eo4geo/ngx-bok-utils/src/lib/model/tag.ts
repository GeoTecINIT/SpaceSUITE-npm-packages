export class Tag {
    label: string = '';
    variant?: Variant = 'primary';
    tooltip:string = '';
    color?: string = '';
    url?: string = '';

    constructor(label: string, variant?: Variant, tooltip?: string, color?: string, url?: string) {
        this.label = label;
        if(variant) this.variant = variant;
        if(tooltip) this.tooltip = tooltip;
        if(color) this.color = color;
        if(url) this.url = url;
    }
}

export type Variant = 'primary' | 'secondary' | 'bok' | 'url';