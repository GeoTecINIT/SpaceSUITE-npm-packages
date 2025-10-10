import { Component} from "@angular/core";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabelModule } from "primeng/floatlabel";
import { FormsModule } from "@angular/forms";
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { CommonModule } from "@angular/common";
import { Subscription } from "rxjs";
import { UserService } from "../../services/user.service";
import { ToastModule } from 'primeng/toast';
import { MessageService } from "primeng/api";
import { Router } from "@angular/router";


@Component({
  standalone: true,
  selector: 'user-page',
  templateUrl: './userPage.component.html',
  styleUrls: ['./userPage.component.css'],
  imports: [ButtonModule, InputIconModule, IconFieldModule, InputTextModule, FloatLabelModule, FormsModule, CommonModule, ToastModule],
  providers: [MessageService]
})
export class UserPageComponent {
  userSubscription!: Subscription;
  userStateSubscription!: Subscription;

  email: string = "";
  name: string = "";
  newName: string = "";

  constructor(private userService: UserService, private messageService: MessageService, private router: Router) {}
  
  ngOnInit() {
    this.userSubscription = this.userService.getNameAndEmail().subscribe(userData => {
      this.email = userData?.email ?? '';
      this.name = userData?.name ?? '';
      this.newName = this.name;
    });
    this.userStateSubscription = this.userService.getUserState().subscribe( userState => {
      if (!userState?.logged) this.router.navigate([''])
    });
}

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
    this.userStateSubscription?.unsubscribe();
  }

  async updateName() {
    try {
      await this.userService.updateUserName(this.newName);
      this.messageService.add({ 
        severity: 'info', 
        summary: 'Info', 
        detail: `Name updated without problems.`,
        life: 3000, 
        closable: true 
      });
    } catch (error) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Something went wrong. Try again later or contact the administrator.', 
        life: 3000, 
        closable: true 
      });
    }
  }

}