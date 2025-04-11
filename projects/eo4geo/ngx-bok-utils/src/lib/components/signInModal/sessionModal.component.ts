import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from "primeng/floatlabel";
import { FormsModule } from "@angular/forms";
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { Message } from 'primeng/message';
import { CommonModule } from "@angular/common";
import { UserService } from "../../services/user.service";

@Component({
  standalone: true,
  selector: 'sessionModal',
  templateUrl: './sessionModal.component.html',
  styleUrls: ['./sessionModal.component.css'],
  imports: [ButtonModule, DialogModule, InputIconModule, IconFieldModule, InputTextModule, FloatLabelModule, FormsModule, CommonModule, Message],
})
export class SessionModalComponent {

  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  login: boolean = true;
  resetpassword: boolean = false;

  email: string = '';
  password: string = '';
  repeatPassword: string = '';

  error: string | null = null;

  constructor(private userService: UserService) {}

  ngOnChanges(changes: SimpleChanges) {
    this.login = changes['visible'].currentValue;
    this.resetpassword = !changes['visible'].currentValue;
    this.email = '';
    this.password = '';
    this.repeatPassword = '';
    this.error = null;
  }

  getHeader(): string {
    if (this.resetpassword) return 'Recover Password';
    if (this.login) return 'Login';
    return 'Register';
  }

  getSwitchLabel() {
    if (this.resetpassword) return 'Return';
    if (!this.login) return 'Login';
    return 'Register';
  }

  clickSwitchButton() {
    this.error = null;
    if (this.resetpassword) this.resetpassword = !this.resetpassword;
    else this.login = !this.login;
  }

  clickMainButton() {
    if (this.resetpassword) return this.recoverPassword();
    if (this.login) return this.loginWithEmailAndPassword();
    return this.registerWithEmailAndPassword();
  }

  async loginWithGoogle() {
    try {
      await this.userService.loginWithGoogle();
      this.visibleChange.emit(false);
    } catch (error: any) {
      this.error = error;
    }
  }

  async loginWithEmailAndPassword() {
    try {
      await this.userService.loginWithEmailAndPassword(this.email, this.password);
      this.visibleChange.emit(false);
    } catch (error: any) {
      this.error = error;
    }
  }

  async registerWithEmailAndPassword() {
    try {
      await this.userService.registerWithEmailAndPassword(this.email, this.password, this.repeatPassword);
      this.visibleChange.emit(false);
    } catch (error: any) {
      this.error = error;
    }
  }

  async recoverPassword() {
    try {
      await this.userService.recoverPassword(this.email);
      this.password = '';
      this.repeatPassword = '';
      this.resetpassword = !this.resetpassword;
    } catch (error: any) {
      this.error = error;
    }
  }
}