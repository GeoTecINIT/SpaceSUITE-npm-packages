# bok-utils

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

### Example Usage

```typescript
import { Component } from '@angular/core';
import { BokComponent } from 'bok-visualization';

@Component({
  selector: 'app-my-component',
  template: `
    <header [items]="headerItems"></header>

    ...

    <footer (openReleaseNotes)="manageEvent()" (openUserManual)="manageEvent2()"></footer>
  `
})
export class MyComponent {
  concept: string = 'GIST';
}

```

### Header

#### `[items]`

- **Type**: MenuItem[] (Class from PrimeNg)
- **Default Value**:

```js
[ 
    {
      label: 'Tools',
      icon: 'pi pi-cog',
      items: [
        {
          label: 'BoK Visualization & Search',
          icon: 'pi pi-search',
          style: {'--p-tieredmenu-item-color': 'var(--hover-color)'},
          iconStyle: {'color': 'var(--hover-color)'}
        },
        {
          label: 'Occupational Profile Tool',
          icon: 'pi pi-users',
          url: 'https://eo4geo-opt.web.app',
        },
        {
          label: 'Job Offer Tool',
          icon: 'pi pi-book',
          url: 'https://eo4geo-jot.web.app',
        },
        {
          label: 'Curriculum Design Tool',
          icon: 'pi pi-graduation-cap',
          url: 'https://eo4geo-cdt.web.app',
        },
        {
          label: 'BoK Annotation Tool',
          icon: 'pi pi-pencil',
          url: 'https://eo4geo-bat.web.app',
        },
        {
          label: 'BoK Matching Tool',
          icon: 'pi pi-equals',
          url: 'https://eo4geo-bmt.web.app',
        }
      ]
    }, 
    {
      label: 'Share',
      icon: 'pi pi-share-alt',
      items: [
        {
          label: 'X',
          icon: 'pi pi-twitter',
          url: 'https://twitter.com/SpaceSUITE_eu',
        },
        {
          label: 'Facebook',
          icon: 'pi pi-facebook',
          url: 'https://www.facebook.com/spacesuiteproject/',
        },
        {
          label: 'Youtube',
          icon: 'pi pi-youtube',
          url: 'https://www.youtube.com/@SpaceSUITE_eu',
        },
        {
          label: 'LinkedIn',
          icon: 'pi pi-linkedin',
          url: 'https://www.linkedin.com/showcase/spacesuite_eu/',
        }
      ]
    }
  ]
```
- **Description**: Determine the sections to display in the header. In case of using the Share label it will show a line with the icons of each subItem.

#### `[toolname]`

- **Type**: string
- **Default Value**: BoK Visualization & Search
- **Description**: Set the current section name to be displayed in the header.

### Footer

#### `(openReleaseNotes)`

- **Type**: void
- **Description**: Emits an event when the ‘Release Notes’ link is clicked.

#### `(openUserManual)`

- **Type**: void
- **Description**: Emits an event when the ‘User Manual’ link is clicked.

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
npm install primeflex@^3.3.0 primeicons@^7.0.0 primeng@^19.0.0
```

## License

This library is licensed under the **MIT** License.