import { Component} from "@angular/core";
import { ButtonModule } from "primeng/button";
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { AccordionModule } from 'primeng/accordion';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from "@angular/common";
import { catchError, filter, finalize, map, Observable, of, retry, Subscription, switchMap, take, tap } from "rxjs";
import { MessageService, ConfirmationService } from "primeng/api";
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { OrganizationService } from "../../services/organization.service";
import { UserService } from "../../services/user.service";
import { OrganizationAdminComponent } from "../organizationAdmin/organizationAdmin.component";
import { OrganizationFormComponent } from "../organizationForm/organizationForm.component";
import { Router } from "@angular/router";
import { EmailService } from "../../services/email.service";

@Component({
  standalone: true,
  selector: 'organization-page',
  templateUrl: './organizationPage.component.html',
  styleUrls: ['./organizationPage.component.css'],
  imports: [ButtonModule, CommonModule, CardModule, ToastModule, SelectModule, FormsModule, OrganizationAdminComponent, TooltipModule, ConfirmDialogModule, AccordionModule, OrganizationFormComponent],
  providers: [MessageService, ConfirmationService]
})
export class OrganizationPageComponent {

  userOrganizations$!: Observable<{_id: string, name: string, description: string, email:string, isAdmin: boolean, isPublic: boolean}[]>;
  adminMessageSubscription!: Subscription;

  organizations$!: Observable<{_id: string, name: string, isPublic: boolean}[]>;
  selectedOrganization: {_id: string, name: string, isPublic: boolean} | undefined;

  duplicatedOrg: boolean = false;

  newOrganization: {_id: string, name: string, description: string, email:string, isAdmin: boolean} = {_id: "", name: "", description: "", email: "", isAdmin: true};
  newOrganizationError: boolean = false;
  newOrganizationAcordion = []

  userStateSubscription!: Subscription;

  constructor(private orgService: OrganizationService, private messageService: MessageService, private confirmationService: ConfirmationService, 
              private userService: UserService, private router: Router, private emailService: EmailService) {}
  
  ngOnInit() {
    this.userOrganizations$ = this.orgService.getUserOrganizations();

    this.organizations$ = this.orgService.getOrganizations().pipe(
      take(1), 
      map(orgs => {
        const organizations = orgs.map(org => ({
          _id: org._id,
          name: org.name.trim().charAt(0).toUpperCase() + org.name.trim().slice(1),
          isPublic: org.isPublic
        }));
        return organizations.sort((a, b) => a.name.localeCompare(b.name));
      })
    );

    this.adminMessageSubscription = this.orgService.adminOrganizationMessages$.subscribe( message => this.messageService.add(message));
    this.userStateSubscription = this.userService.getUserState().subscribe( userState => {
      if (!userState?.logged) this.router.navigate([''])
    });
  }

  ngOnDestroy() {
    this.adminMessageSubscription?.unsubscribe();
    this.userStateSubscription?.unsubscribe();
  }

  leaveOrganization(orgId: string, orgName: string) {
    let isSuccess = true;
    this.orgService.leaveOrganization(orgId).pipe(
      catchError((error) => {
        isSuccess = false;
        this.messageService.add({ 
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
          this.messageService.add({ 
            severity: 'info', 
            summary: 'Info', 
            detail: `You left ${orgName} without problems.`,
            life: 3000, 
            closable: true 
          }); 
        }
      })
    ).subscribe();
  }

  private checkSelectedOrganization(): Observable<boolean> {
    if (!this.selectedOrganization) {
      return of(false);
    }

    return this.userOrganizations$.pipe(
      take(1),
      map(userOrgs =>
        userOrgs.some(o => o._id === this.selectedOrganization!._id)
      ),
      tap(isDuplicated => {
        if (isDuplicated) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Warn',
            detail: 'You cannot join an organization to which you already belong.',
            life: 3000,
            closable: true,
          });
          this.duplicatedOrg = true;
        }
      }),
      map(isDuplicated => !isDuplicated)
    );
  }

  joinOrganization() {
    this.checkSelectedOrganization().pipe(
      filter(valid => valid),
      switchMap(() => {
        const orgId: string = this.selectedOrganization!._id;
        const orgName: string = this.selectedOrganization!.name;
        if (!this.selectedOrganization?.isPublic) {
          return this.joinPrivateOrganization(orgId, orgName);
        }
        else {
          return this.joinPublicOrganization(orgId, orgName);
        }
      })
    ).subscribe();
  }

  private joinPublicOrganization(orgId: string, orgName: string) {
    let isSuccess = true;
    return this.orgService.joinOrganization(orgId).pipe(
      catchError((error) => {
        isSuccess = false;
        this.messageService.add({ 
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
          this.selectedOrganization = undefined;
          this.messageService.add({ 
            severity: 'info', 
            summary: 'Info', 
            detail: `You joined ${orgName} without problems.`,
            life: 3000, 
            closable: true 
          });
        }
      })
    );
  }

  private joinPrivateOrganization(orgId: string, orgName: string) {
    let isSuccess = true;
    return this.orgService.requestAccessToOrganization(orgId).pipe(
      catchError((error) => {
        isSuccess = false;
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: error.message ?? 'Something went wrong. Try again later or contact the administrator.', 
          life: 3000, 
          closable: true 
        });
        return of(null);
      }),
      switchMap(() => {
        if (isSuccess) return this.emailService.sendRequestedAccessEmail(orgId).pipe(retry(5));
        return of(null);
      }),
      catchError(() => {
        isSuccess = false;
        this.messageService.add({ 
          severity: 'warn', 
          summary: 'Warning', 
          detail: `You requested access to ${orgName}. No notification email was sent, but your request remains available in the app.`, 
          life: 3000, 
          closable: true 
        });
        return of(null);
      }),
      finalize(() => {
        if (isSuccess) {
          this.selectedOrganization = undefined;
          this.messageService.add({ 
            severity: 'info', 
            summary: 'Info', 
            detail: `You requested access to ${orgName} without problems.`,
            life: 3000, 
            closable: true 
          });
        }
      })
    );
  }

  updateDuplicatedOrg() {
    if (this.duplicatedOrg) this.duplicatedOrg = false;
  }

  copyEmail(email: string, name: string): void {
    navigator.clipboard.writeText(email);
    this.messageService.add({ 
      severity: 'info', 
      summary: 'Info', 
      detail: `You copied ${name} contact email without problems.`,
      life: 3000, 
      closable: true 
    });
  }

  deleteModal(event: Event, orgId: string, orgName: string) {
    this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'Do you want to leave this organization?',
        header: 'Leave Organization',
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
          this.leaveOrganization(orgId, orgName);
        },
        reject: () => {
        },
    });
  }

  createOrganization(createData: {name: string | null, description: string | null, contact: string | null, isPublic: boolean}) {
    if (!createData.name?.trim() || !createData.description?.trim() || !createData.contact?.trim()) {
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Warn', 
        detail: 'You cannot create an organization until you fill in all the fields.',
        life: 3000, 
        closable: true,
      });
      this.newOrganizationError = true;
      return;
    }
    let isSuccess = true;
    this.orgService.createOrganization(createData.name, createData.description, createData.contact, createData.isPublic).pipe(
      catchError((error) => {
        isSuccess = false;
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: error.message ?? 'Something went wrong. Try again later or contact the administrator.', 
          life: 3000, 
          closable: true 
        });
        this.newOrganizationError = true;
        return of(null);
      }),
      finalize(() => {
        if (isSuccess) {
          this.messageService.add({ 
            severity: 'info', 
            summary: 'Info', 
            detail: `You created ${createData.name} without problems.`,
            life: 3000, 
            closable: true 
          });
          this.newOrganizationError = false;
          this.newOrganization = {_id: "", name: "", description: "", email: "", isAdmin: true};
          this.newOrganizationAcordion = []
        }
      })
    ).subscribe();
  }
  
  newOrganizationValidation(data: [string, string][]): boolean {
    return data.some(([first, second]) => first === second || first === "");
  }
}