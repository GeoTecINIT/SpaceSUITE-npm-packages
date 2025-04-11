import { Component, EventEmitter, Input, Output, SimpleChanges} from "@angular/core";
import { ButtonModule } from "primeng/button";
import { FormsModule } from '@angular/forms';
import { CommonModule } from "@angular/common";
import { InputIconModule } from "primeng/inputicon";
import { IconFieldModule } from "primeng/iconfield";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabelModule } from "primeng/floatlabel";
import { TextareaModule } from 'primeng/textarea';

@Component({
  standalone: true,
  selector: 'organization-form',
  templateUrl: './organizationForm.component.html',
  styleUrls: ['./organizationForm.component.css'],
  imports: [ButtonModule, CommonModule, FormsModule, InputIconModule, IconFieldModule, InputTextModule, FloatLabelModule, TextareaModule],
})
export class OrganizationFormComponent {

  @Input() organization!: {_id: string, name: string, description: string, email:string, isAdmin: boolean};
  @Input() descriptionError: boolean = false;
  @Input() buttonLabel: string = "Update Information";
  @Input() validationFunction: Function = (data: [string, string][]): boolean => {
    for (let pair of data) {
      if (pair[0] != pair[1]) return false
    }
    return true
  };
  @Output() formChange: EventEmitter<{name: string | null, description: string | null, contact: string | null}> = new EventEmitter();

  newName: string = "";
  newDescription: string = "";
  newContact: string = "";

  emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  isValidEmail = (email: string): boolean => this.emailRegex.test(email);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['organization'] && this.organization) {
      this.newName = changes['organization'].currentValue.name;
      this.newDescription = changes['organization'].currentValue.description;
      this.newContact = changes['organization'].currentValue.email;
    }
  }

  descriptionFormModified() {
    const pairs: [string, string][] = [[this.newName, this.organization.name], [this.newDescription, this.organization.description], [this.newContact, this.organization.email]];
    return this.validationFunction(pairs) || !this.isValidEmail(this.newContact);
  }

  updateDescription() {
    const updateInfo = {
      name: this.newName != this.organization.name ? this.newName : null,
      description: this.newDescription != this.organization.description ? this.newDescription : null,
      contact: this.newContact != this.organization.email ? this.newContact : null
    }
    this.formChange.emit(updateInfo);
  }

}