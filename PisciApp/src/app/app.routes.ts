import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { MainLayoutComponent } from './shared/layout/main-layout/main-layout.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'reiniciar-contraseña',
    loadComponent: () =>
      import(
        './features/auth/pages/contrasena-olvidada/contrasena-olvidada.component'
      ).then((m) => m.ContrasenaOlvidadaComponent),
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./features/auth/pages/verify-email/verify-email.component').then(
        (m) => m.VerifyEmailComponent
      ),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'inventory',
        loadChildren: () =>
          import('./features/inventory/inventory.routes').then(
            (m) => m.INVENTORY_ROUTES
          ),
      },
      { path: '', redirectTo: 'inventory', pathMatch: 'full' },
    ],
  },
  {
    path: 'configuracion',
    loadComponent: () =>
      import(
        './features/configuracion/pages/configuracion/configuracion.component'
      ).then((m) => m.ConfiguracionComponent),
  },
  {
    path: 'inicio',
    loadComponent: () =>
      import(
        './features/inicio/inicio.component'
      ).then((m) => m.InicioComponent),
  },
  {
    path: 'estanques',
    loadComponent: () =>
      import(
        './features/tanques/tanques.component'
      ).then((m) => m.TanquesComponent),
  },
  {
    path: 'producto',
    loadComponent: () =>
      import(
        './features/producto/producto.component'
      ).then((m) => m.ProductoComponent),
  }
  //{ path: '**', redirectTo: 'login' },
];
