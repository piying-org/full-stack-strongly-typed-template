import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { trpc } from './trpc';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  router = inject(Router);
  async login(data: any) {
    const result = await trpc.account.login.mutate(data);
    localStorage.setItem('token', result.token);
    localStorage.setItem('roleList', JSON.stringify(result.roleList));
    this.router.navigateByUrl('/dashboard');
  }
}
