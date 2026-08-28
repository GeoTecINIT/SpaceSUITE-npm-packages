import { Component, Input} from "@angular/core";
import { ButtonModule } from "primeng/button";
import { TableModule } from 'primeng/table';
import { ToggleSwitchChangeEvent, ToggleSwitchModule } from 'primeng/toggleswitch';
import { AccordionModule } from 'primeng/accordion';
import { FormsModule } from '@angular/forms';
import { CommonModule } from "@angular/common";
import { OrganizationService } from "../../services/organization.service";
import { ConfirmationService } from "primeng/api";
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { catchError, finalize, of, Subscription, concatMap } from "rxjs";
import { InputIconModule } from "primeng/inputicon";
import { IconFieldModule } from "primeng/iconfield";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabelModule } from "primeng/floatlabel";
import { UserService } from "../../services/user.service";
import { OrganizationFormComponent } from "../organizationForm/organizationForm.component";
import { BadgeModule } from 'primeng/badge';

@Component({
  standalone: true,
  selector: 'organization-admin',
  templateUrl: './organizationAdmin.component.html',
  styleUrls: ['./organizationAdmin.component.css'],
  imports: [ButtonModule, CommonModule, TableModule, ToggleSwitchModule, FormsModule, AccordionModule, InputIconModule,
    IconFieldModule, InputTextModule, FloatLabelModule, ConfirmDialogModule, OrganizationFormComponent, BadgeModule],
  providers: [ConfirmationService]
})
export class OrganizationAdminComponent {

  @Input() organization!: {_id: string, name: string, description: string, email:string, isAdmin: boolean};
  users: { _id: string; name: string; email: string; isAdmin: boolean;}[] = [];
  pendingUsers: { _id: string; name: string; email: string; isAdmin: boolean;}[] = [];
  skelletonData: any[] = Array.from({ length: 5 }).map(() => {});
  divisions: string[] = [];

  newDivision: string = "";
  divisionError: boolean = false;

  descriptionError: boolean = false;

  newUser: string = "";
  userError: boolean = false;

  private usersSubscription!: Subscription;
  private pendingUsersSubscription!: Subscription;
  private divisionsSubscription!: Subscription;

  inplaceIndicator: boolean = false;

  constructor(private orgService: OrganizationService, private userService: UserService, private confirmationService: ConfirmationService) {}
  
  ngOnInit() {
    this.usersSubscription = this.orgService.getOrganizationUsers(this.organization._id).subscribe(newUsers => this.users = newUsers.sort((a, b) => b.email.localeCompare(a.email)));
    this.pendingUsersSubscription = this.orgService.getOrganizationPendingUsers(this.organization._id).subscribe(newUsers => this.pendingUsers = newUsers.sort((a, b) => b.email.localeCompare(a.email)));
    this.divisionsSubscription = this.orgService.getOrganizationDivisions(this.organization._id).subscribe(newDivisions => this.divisions = newDivisions);
  }

  ngOnDestroy() {
    this.unsubscribe()
  }

  private unsubscribe() {
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }
    if (this.divisionsSubscription) {
      this.divisionsSubscription.unsubscribe();
    }
    if (this.pendingUsersSubscription) {
      this.pendingUsersSubscription.unsubscribe();
    }
  }

  isCurrentUser(userId: string) {
    return this.userService.isCurrentUser(userId);
  }

  deleteUser(userId: string, userName: string) {
    let isSuccess = true;
    this.orgService.deleteUserFromOrganization(this.organization._id, userId).pipe(
      catchError(error => {
        isSuccess = false;
        this.orgService.emitMessage({ 
          severity: 'error', 
          summary: 'Error', 
          detail: error.message ?? 'Something went wrong. Try again later or contact the administrator.', 
          life: 3000, 
          closable: true 
        });
        return of(null);
      }),
      finalize(() => {
        if (isSuccess) {
          this.orgService.emitMessage({ 
            severity: 'info', 
            summary: 'Info', 
            detail: `You deleted ${userName ?? userId} from the organization without problems.`,
            life: 3000, 
            closable: true 
          });
        }
      })
    ).subscribe();
  }

  switchAdminStateModal(event: ToggleSwitchChangeEvent, userId: string, userName: string, newState: boolean) {
    this.confirmationService.confirm({
        target: event.originalEvent.target as EventTarget,
        message: `Do you want to change ${userName} admin status?`,
        header: 'Change Admin Status',
        icon: 'pi pi-info-circle',
        rejectLabel: 'Cancel',
        rejectButtonProps: {
            label: 'Cancel',
            severity: 'secondary',
        },
        acceptButtonProps: {
            label: 'Delete',
            severity: 'primary',
        },

        accept: () => {
          this.switchAdminState(userId, userName, newState);
        },
        reject: () => {
          const user = this.users.find(u => u._id === userId);
          if (user) user.isAdmin = !newState;
        },
    });
  }

  switchAdminState(userId: string, userName: string, newState: boolean) {
    let isSuccess = true;
    this.orgService.changeAdminState(this.organization._id, userId, newState).pipe(
      catchError(error => {
        isSuccess = false;
        const user = this.users.find(u => u._id === userId);
        if (user) user.isAdmin = !newState;
        this.orgService.emitMessage({ 
          severity: 'error', 
          summary: 'Error', 
          detail: error.message ?? 'Something went wrong. Try again later or contact the administrator.', 
          life: 3000, 
          closable: true 
        });
        return of(null);
      }),
      finalize(() => {
        if (isSuccess) {
          const user = this.users.find(u => u._id === userId);
          if (user) user.isAdmin = newState;
          if(this.isCurrentUser(userId)) this.organization.isAdmin = newState;
          this.orgService.emitMessage({ 
            severity: 'info', 
            summary: 'Info', 
            detail: newState ? `${userName ?? userId} is now an administrator of the organization.` : `${userName ?? userId} is no longer an administrator of the organization.`,
            life: 3000, 
            closable: true 
          });
        }
      })
    ).subscribe();
  }

  deleteDivision(division: string) {
    let isSuccess = true;
    this.orgService.deleteDivision(this.organization._id, division).pipe(
      catchError(error => {
        isSuccess = false;
        this.orgService.emitMessage({ 
          severity: 'error', 
          summary: 'Error', 
          detail: error.message ?? 'Something went wrong. Try again later or contact the administrator.', 
          life: 3000, 
          closable: true 
        });
        return of(null);
      }),
      finalize(() => {
        if (isSuccess) {
          this.orgService.emitMessage({ 
            severity: 'info', 
            summary: 'Info', 
            detail: `You deleted ${division} from the organization without problems.`,
            life: 3000, 
            closable: true 
          });
        }
      })
    ).subscribe();
  }

  addDivision() {
    if (this.divisions.includes(this.newDivision)) {
      this.divisionError = true;
      this.orgService.emitMessage({ 
        severity: 'warn', 
        summary: 'Warn', 
        detail: 'You cannot add an existing division.',
        life: 3000, 
        closable: true,
      });
      return;
    }
    let isSuccess = true;
    this.orgService.addDivisions(this.organization._id, this.newDivision).pipe(
      catchError(error => {
        isSuccess = false;
        this.divisionError = true;
        this.orgService.emitMessage({ 
          severity: 'error', 
          summary: 'Error', 
          detail: error.message ?? 'Something went wrong. Try again later or contact the administrator.', 
          life: 3000, 
          closable: true 
        });
        return of(null);
      }),
      finalize(() => {
        if (isSuccess) {
          this.divisionError = false;
          this.orgService.emitMessage({ 
            severity: 'info', 
            summary: 'Info', 
            detail: `You added ${this.newDivision} to the organization without problems.`,
            life: 3000, 
            closable: true 
          });
          this.newDivision = "";
        }
      })
    ).subscribe();
  }

  updateDescription(updateInfo: {name: string | null, description: string | null, contact: string | null}) {
    let isSuccess = true;
    this.orgService.updateOrganizationInformation(this.organization._id, updateInfo).pipe(
      catchError(error => {
        isSuccess = false;
        this.descriptionError = true;
        this.orgService.emitMessage({ 
          severity: 'error', 
          summary: 'Error', 
          detail: error.message ?? 'Something went wrong. Try again later or contact the administrator.', 
          life: 3000, 
          closable: true 
        });
        return of(null);
      }),
      finalize(() => {
        if (isSuccess) {
          this.descriptionError = false;
          this.organization.name = updateInfo.name ?? this.organization.name;
          this.organization.description = updateInfo.description ?? this.organization.description;
          this.organization.email = updateInfo.contact ?? this.organization.email;          
          this.orgService.emitMessage({ 
            severity: 'info', 
            summary: 'Info', 
            detail: `You modified the organization description without problems.`,
            life: 3000, 
            closable: true 
          });
        }
      })
    ).subscribe();
  }

  addUserToOrganization() {
    let isSuccess = true;
    this.userService.getUidWithEmail(this.newUser).pipe(
      concatMap(data => {
        if(this.users.some(user => user._id === data.uid)) {
          isSuccess = false;
          this.userError = true;
          this.orgService.emitMessage({ 
            severity: 'warn', 
            summary: 'Warn', 
            detail:`${this.newUser} already belong to this organization.`, 
            life: 3000, 
            closable: true 
          });
          return of(null);
        }
        return this.orgService.addUserToOrganization(this.organization._id, data.uid)
      }),
      catchError(error => {
        isSuccess = false;
        this.userError = true;
        this.orgService.emitMessage({ 
          severity: 'error', 
          summary: 'Error', 
          detail: error.message ?? 'Something went wrong. Try again later or contact the administrator.', 
          life: 3000, 
          closable: true 
        });
        return of(null);
      }),
      finalize(() => {
        if (isSuccess) {      
          this.userError = false;
          this.orgService.emitMessage({ 
            severity: 'info', 
            summary: 'Info', 
            detail: `You added ${this.newUser} to the organization without problems.`,
            life: 3000, 
            closable: true 
          });
          this.newUser = "";
        }
      })
    ).subscribe();
  }

  deleteUserModal(event: Event, userId: string, userName: string) {
    this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: `Do you want to delete ${userName} from this organization?`,
        header: 'Delete User',
        icon: 'pi pi-info-circle',
        rejectLabel: 'Cancel',
        rejectButtonProps: {
            label: 'Cancel',
            severity: 'secondary',
        },
        acceptButtonProps: {
            label: 'Delete',
            severity: 'primary',
        },

        accept: () => {
          this.deleteUser(userId, userName);
        },
        reject: () => {
        },
    });
  }

  deleteDivisionModal(event: Event, division: string) {
    this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: `Do you want to delete ${division} from this organization?`,
        header: 'Delete Division',
        icon: 'pi pi-info-circle',
        rejectLabel: 'Cancel',
        rejectButtonProps: {
            label: 'Cancel',
            severity: 'secondary',
        },
        acceptButtonProps: {
            label: 'Delete',
            severity: 'primary',
        },

        accept: () => {
          this.deleteDivision(division);
        },
        reject: () => {
        },
    });
  }

  deleteOrganizationModal(event: Event) {
    this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: `Do you want to delete this organization?`,
        header: 'Delete Organization',
        icon: 'pi pi-info-circle',
        rejectLabel: 'Cancel',
        rejectButtonProps: {
            label: 'Cancel',
            severity: 'secondary',
        },
        acceptButtonProps: {
            label: 'Delete',
            severity: 'primary',
        },

        accept: () => {
          this.deleteOrganization()
        },
        reject: () => {
        },
    });
  }

  deleteOrganization() {
    let isSuccess = true;
    this.orgService.deleteOrganization(this.organization._id, this.users.map(user => user._id)).pipe(
      catchError(error => {
        isSuccess = false;
        this.orgService.emitMessage({ 
          severity: 'error', 
          summary: 'Error', 
          detail: error.message ?? 'Something went wrong. Try again later or contact the administrator.', 
          life: 3000, 
          closable: true 
        });
        return of(null);
      }),
      finalize(() => {
        if (isSuccess) {
          this.orgService.emitMessage({ 
            severity: 'info', 
            summary: 'Info', 
            detail: `You deleted ${this.organization.name} without problems.`,
            life: 3000, 
            closable: true 
          });
        }
      })
    ).subscribe();
  }

  acceptPendingUser(userId: string, userName: string) {
    let isSuccess = true;
    this.orgService.addPendingUserToOrganization(this.organization._id, userId).pipe(
      catchError(error => {
        isSuccess = false;
        this.orgService.emitMessage({ 
          severity: 'error', 
          summary: 'Error', 
          detail: error.message ?? 'Something went wrong. Try again later or contact the administrator.', 
          life: 3000, 
          closable: true 
        });
        return of(null);
      }),
      finalize(() => {
        if (isSuccess) {
          // TODO - notify user
          this.orgService.emitMessage({ 
            severity: 'info', 
            summary: 'Info', 
            detail: `${userName ?? userId} is now part of ${this.organization.name}.`,
            life: 3000, 
            closable: true 
          });
        }
      })
    ).subscribe();
  }

  rejectPendingUser(userId: string, userName: string) {
    let isSuccess = true;
    this.orgService.removePendingUserFromOrganization(this.organization._id, userId).pipe(
      catchError(error => {
        isSuccess = false;
        this.orgService.emitMessage({ 
          severity: 'error', 
          summary: 'Error', 
          detail: error.message ?? 'Something went wrong. Try again later or contact the administrator.', 
          life: 3000, 
          closable: true 
        });
        return of(null);
      }),
      finalize(() => {
        if (isSuccess) {
          // TODO - notify user
          this.orgService.emitMessage({ 
            severity: 'info', 
            summary: 'Info', 
            detail: `${userName ?? userId} is now part of ${this.organization.name}.`,
            life: 3000, 
            closable: true 
          });
        }
      })
    ).subscribe();
  }
}