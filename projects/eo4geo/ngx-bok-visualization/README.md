# bok-visualization

`bok-visualization` is an Angular library designed to facilitate the visualisation of the SpaceSUITE Body of Knowledge thanks to **D3.js** and **PrimeNG**. It provides not only a reusable and configurable component for easy integration into Angular applications but also a service that retrieves and offers detailed information about concepts based on their code.

## Features

- **Visualization Component**: A reusable, configurable Angular component that allows users to visualize the Body of Knowledge interactively.
- **Concept Information Service**: A service that provides detailed information about concepts based on their code, enabling dynamic retrieval of concept descriptions and related data.

## Installation

First, install the library in your Angular project:

```bash
npm install bok-visualization
```

Make sure the required dependencies are installed in your project, as `bok-visualization` lists them as peerDependencies.

## Configuration

### Styling Configuration

To configure the colours to be used by the component, go to the file ‘src/styles.css’ and set the following variables. Additionally we can define the font and font colour of the project:

```css
:root {
    --primary-color: #0e145d;
    --secondary-color: #3fb3f8;
    --hover-color: #f46524;
    --danger-color: #ce3a41;
    --warning-color: #ffd400;
}

body {
    color: var(--primary-color);
    font-family: 'Poppins', sans-serif;
}
```

## PrimeNG Setup in main.ts

In your `main.ts` file, add the **PrimeNG** and **Angular animations** setup:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: Aura,
                options: {
                    prefix: 'p',
                    darkModeSelector: false,
                    cssLayer: false
                }             
            }
        })
  ]
});
```

## Using the Library

Once installed and configured, you can begin using the components from the library in your Angular application.

### Example Usage: Visualization Component

```typescript
import { Component } from '@angular/core';
import { BokComponent } from 'bok-visualization';

@Component({
  selector: 'app-my-component',
  template: `
    <h1>Body of Knowledge</h1>
    <bok-visualization [(selectedConcept)]="concept" [showDescription]="true" [showVersion]="true" [showSearchEngine]="true"></bok-visualization>
  `
})
export class MyComponent {
  concept: string = 'GIST';
}

```

#### Inputs & Outputs

##### `[selectedConcept]` (Two-way binding)

- **Type**: `string`
- **Default Value**: 'GIST'
- **Description**: Represents the currently selected concept. This input allows you to bind a variable to track or modify the selected concept. The component will update the bound variable whenever the selected concept changes.

##### `[showDescription]`

- **Type**: boolean
- **Default Value**: `true`
- **Description**: Determines whether the component displays a description for the selected concept. If `true`, a detailed description section will be rendered.

##### `[showVersion]`

- **Type**: boolean
- **Default Value**: `true`
- **Description**: Indicates if the component should display a list of versions of the Body of Knowledge. When set to `true`, the list appears and allow the user to change the version.

##### `[showSearchEngine]`

- **Type**: boolean
- **Default Value**: `true`
- **Description**: Controls the visibility of the search engine functionality within the component. If `true`, a search engine interface will be displayed, allowing users to search for concepts

### Example Usage: Concept Information Service

```typescript
import { Component, OnInit } from '@angular/core';
import { BokInfoService } from 'bok-visualization';

@Component({
  selector: 'app-concept-info',
  template: `
    <div *ngIf="conceptName">
      <h2>{{ conceptName }}</h2>
    </div>
  `
})
export class ConceptInfoComponent implements OnInit {
  conceptName: any;

  constructor(private bokInfoService: BokInformationService) {}

  ngOnInit() {
    this.bokInfoService.getConceptName('GIST').subscribe(name => {
      this.conceptName = name;
    });
  }
}

```

#### Methods

##### getConceptColor(code: string): Observable<string>

This method retrieves the color associated with a specific concept, based on its knowledge area. The code parameter is used to extract the knowledge area code (first two characters) and then fetches the corresponding color.

##### getConceptName(code: string): Observable<string>

This method retrieves the name associated with a concept, using its code.

##### getKnowledgeAreas(code: string): Observable<string[]>

This method fetches the knowledge areas that are related to a concept, based on its code. It checks the parents of the concept and identifies the relevant knowledge areas.

## Dependencies

`bok-visualization` requires the following dependencies to be installed in your project:

- **Angular**: Version 19.1.x
- **primeng**: Version 19.0.x
- **d3**: Version 7.9.x
- **primeflex**: Version 3.3.x
- **primeicons**: Version 7.0.x

### Installation

To install the dependencies, run the following command:

```bash
npm install d3@^7.9.0 primeflex@^3.3.0 primeicons@^7.0.0 primeng@^19.0.0
```

## License

This library is licensed under the **MIT** License.