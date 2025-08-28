import { Injectable } from '@angular/core';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private readonly userService: UserService) {}

  public getUserState() {
    return this.userService.getUserState()
  }
}
