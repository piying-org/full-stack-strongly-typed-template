import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  Routes,
} from '@angular/router';
import { SchemaViewRC } from './schema-view/component';
import {
  Account_View,
  Login_View,
  Role_View,
  RoleGroup_View,
  Version_View,
} from '@project/define';
import { LoginService } from './service/login.service';
import { NavComponent } from './page/nav/nav.component';
import { inject } from '@angular/core';
import { trpc } from './service/trpc';
export const authGuard = (
  route?: ActivatedRouteSnapshot,
  state?: RouterStateSnapshot,
) => {
  const result = localStorage.getItem('token');
  if (!result) {
    const router = inject(Router);
    return router.parseUrl('/login');
  }
  return true;
};

export const routes: Routes = [
  {
    path: 'login',
    component: SchemaViewRC,
    data: { schema: Login_View, context: () => inject(LoginService) },
  },
  {
    path: 'dashboard',
    children: [
      {
        path: 'version',
        component: SchemaViewRC,
        data: {
          schema: Version_View,
          context: () => {
            return {
              trpc,
            };
          },
        },
      },
      {
        path: 'account',
        component: SchemaViewRC,
        data: {
          schema: Account_View,
          context: () => {
            return {
              trpc,
            };
          },
        },
      },
      {
        path: 'role',
        component: SchemaViewRC,
        data: {
          schema: Role_View,
          context: () => {
            return {
              trpc,
            };
          },
        },
      },
      {
        path: 'role-group',
        component: SchemaViewRC,
        data: {
          schema: RoleGroup_View,
          context: () => {
            return {
              trpc,
            };
          },
        },
      },
      { path: '', redirectTo: 'version', pathMatch: 'full' },
    ],
    canActivate: [authGuard],
    component: NavComponent,
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
