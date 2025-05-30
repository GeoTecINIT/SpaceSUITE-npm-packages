import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { ButtonModule } from 'primeng/button';

@Component({
  standalone: true,
  selector: 'not-found-page',
  templateUrl: './notFoundPage.component.html',
  styleUrls: ['./notFoundPage.component.css'],
  imports: [ButtonModule],
})
export class NotFoundPageComponent {
  constructor(private router: Router) {}

  goToHomepage() {
    this.router.navigate(['']);
  }
}