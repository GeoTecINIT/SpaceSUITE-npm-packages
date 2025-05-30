import { CommonModule } from '@angular/common';
import {Component, EventEmitter, HostListener, inject, Input, Output} from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { filter, Subscription } from 'rxjs';
import { SessionModalComponent } from "../signInModal/sessionModal.component";
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [ButtonModule, TieredMenuModule, CommonModule, AvatarModule, AvatarGroupModule, SessionModalComponent],
})
export class HeaderComponent {
  @Input() items: MenuItem[] = [ 
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
  ];

  userItems: MenuItem[] = [
    {
      label: 'Profile', 
      icon: 'pi pi-user',
      command: () => {
        this.profileClick.emit();
      }
    },
    {
      label: 'Organization', 
      icon: 'pi pi-users',
      command: () => {
        this.organizationClick.emit();
      }
    }, 
    {
      label: 'Logout', 
      icon: 'pi pi-sign-out', 
      command: () => {
        this.logout();
      }
    }
  ];

  unregisteredUserItems: MenuItem[] = [
    {
      label: 'Login', 
      icon: 'pi pi-sign-in', 
      command: () => {
        this.showLoginModal = !this.showLoginModal
      }
    }
  ];

  buttonItems: MenuItem[] = this.items.concat(this.unregisteredUserItems);

  @Input() toolName: string = "BoK Visualization & Search";
  @Input() login: boolean = false;
  @Output() profileClick: EventEmitter<void> = new EventEmitter()
  @Output() organizationClick: EventEmitter<void> = new EventEmitter()
  
  hideMenu: boolean = true;
  logged: boolean = false;
  nameInitial: string = 'A';

  showLoginModal: boolean = false;

  private userStateSubscription!: Subscription;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    this.userStateSubscription = this.userService.getUserState().pipe(filter(value => value != undefined)).subscribe(({ logged, nameInitial }) => {
      this.logged = logged;
      this.nameInitial = nameInitial;
      if (this.logged) this.buttonItems = this.items.concat(this.userItems);
      else this.buttonItems = this.items.concat(this.unregisteredUserItems);
    });
  }

  ngOnDestroy() {
    this.userStateSubscription?.unsubscribe();
  }

  async logout() {
    await this.userService.logout();
  }

  @HostListener('document:click', ['$event'])
  clickout(event: { target: any }) {
    if (!event.target.closest("p-tieredmenu") && !event.target.closest("p-button.custom-header-button")) {
      this.hideMenu = true;
    }
  }

  navigateToMainPage() {
    this.router.navigate(['']);
  }
}
