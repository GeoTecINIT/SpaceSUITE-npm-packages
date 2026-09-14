import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { from, map, Observable, of, switchMap, take, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { OrganizationService } from './organization.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class EmailService {

  private URL_UPDATE_SERVICE = environment.URL_UPDATE_SERVICE;
  private auth: Auth;

  constructor(private readonly http: HttpClient, private readonly organizationService: OrganizationService, private readonly userService:UserService) {
    this.auth = inject(Auth);
  }

  public sendRequestedAccessEmail(orgId: string) {
    return this.organizationService.getOrganizationInfo(orgId).pipe(
      take(1),
      switchMap((organization: {_id: string, name: string, description: string, email: string, isAdmin: boolean, isPublic: boolean}) => {
        const html = `<p>Dear ${organization.name} Administrators,<br><br>
        A new user has requested to join the ${organization.name} organization.<br> 
        You can approve or reject the request from the organization's administrator dashboard, which is accessible from the SpaceSUITE applications.<br>
        Best regards,<br>
        SpaceSuite Team.</p>`

        const body = 
        { 
          'subject': `SpaceSUITE - New request to join ${organization}`,
          'emailReceivers': [organization.email],
          'html': html
        };

        return this.sendEmail(body);
      })
    )
  }

  public sendAprovedAccessEmail(organization: string, userId: string) {
    return this.userService.getEmailWithUid(userId).pipe(
      switchMap(email => {
        if (email != '') {
          const html = `<p>Dear ${email},<br><br>
          You've been accepted into the ${organization} organization.<br> 
          You can create new resources under this organization using the different SpaceSUITE applications.<br>
          Best regards,<br>
          SpaceSuite Team.</p>`

          const body = 
          { 
            'subject': `SpaceSUITE - You've been accepted into ${organization}`,
            'emailReceivers': [email],
            'html': html
          };

          return this.sendEmail(body);
        }
        else throw new Error("The selected user don't have an email!");
      })
    );
  }

  public sendRejectedAccessEmail(organization: string, userId: string) {
    return this.userService.getEmailWithUid(userId).pipe(
      switchMap(email => {
        if (email != '') {
          const html = `<p>Dear ${email},<br><br>
          Your request to join ${organization} have been rejected.<br>
          Best regards,<br>
          SpaceSuite Team.</p>`

          const body = 
          { 
            'subject': `SpaceSUITE - Your request to join ${organization} have been rejected`,
            'emailReceivers': [email],
            'html': html
          };

          return this.sendEmail(body);
        }
        else throw new Error("The selected user don't have an email!");
      })
    );
  }

  private sendEmail(body: any): Observable<HttpResponse<string>> {
    return throwError(() => new Error('Email server is not available!'))
    return this.getToken().pipe(
      switchMap(idToken => {
        if (idToken == null) throwError(() => new Error('The user is not authenticated!'));
        const headers = {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Authorization': `Bearer ${idToken}`,
        };
        

        return this.http.post(
          this.URL_UPDATE_SERVICE + 'send-email',
          body,
          {
            headers,
            observe: 'response',
            responseType: 'text'
          }
        );
      })
    )
  }

  private getToken(): Observable<string | null> {
    if (this.auth.currentUser)
      return from(this.auth.currentUser.getIdToken());
    else return of(null);
  }

}