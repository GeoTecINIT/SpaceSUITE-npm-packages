import { Injectable } from '@angular/core';
import { Observable, switchMap, take } from 'rxjs';
import { OrganizationService } from './organization.service';
import { UserService } from './user.service';
import * as gapis from 'googleapis'
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EmailService {

  private gmail: gapis.gmail_v1.Gmail;

  constructor(private readonly organizationService: OrganizationService, private readonly userService:UserService) {
    const auth = new gapis.google.auth.JWT({
      email: environment.SERVICE_ACCOUNT.client_email,
      key: environment.SERVICE_ACCOUNT.private_key,
      scopes: ["https://www.googleapis.com/auth/gmail.send"],
      subject: environment.SPACESUITE_EMAIL,
    });

    this.gmail = gapis.google.gmail({ version: "v1", auth });
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

  private sendEmail(body: any): Observable<string> {
    const mime = [
      `To: ${body.emailReceivers}`,
      `From: ${environment.SPACESUITE_EMAIL}`,
      `Subject: ${body.subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=UTF-8",
      "",
      body.html,
    ].join("\r\n");

    const raw = Buffer.from(mime).toString("base64url");

    return new Observable<string>(subscriber => {
      this.gmail.users.messages.send({
        userId: "me",
        requestBody: { raw },
      }).then(response => {
        if (subscriber.closed) return;
        subscriber.next(response.data.id ?? '');
        subscriber.complete();
      }).catch((err: any) => {
        if (subscriber.closed) return;
        subscriber.error(err.response?.data?.error?.message ?? err.message ?? 'Gmail request failed',);
      })
    });
  }

}