import {  CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { map, take } from 'rxjs';

export const AuthGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.getUserState().pipe(
    take(1),
    map(user => {
      if (user?.logged) {
        return true;
      } else {
        router.navigate(['']);
        return false;
      }
    })
  );
};