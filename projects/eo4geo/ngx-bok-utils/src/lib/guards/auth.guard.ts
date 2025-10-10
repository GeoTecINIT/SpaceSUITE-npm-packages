import { CanMatchFn } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { filter, map, take } from 'rxjs';

export const AuthGuard: CanMatchFn = () => {
  const userService = inject(UserService);
  return userService.getUserState().pipe(
    filter(value => value !== undefined),
    take(1),
    map(user => user?.logged)
  );
};