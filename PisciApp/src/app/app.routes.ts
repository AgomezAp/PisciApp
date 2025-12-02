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
    path: 'registroempresa',
    loadComponent: () =>
      import('./features/auth/pages/registro-empresa/registro-empresa.component').then(
        (m) => m.RegistroEmpresaComponent
      ),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'inicioPerfil',
        loadComponent: () =>
          import(
            './features/inicio-perfil/inicio-perfil.component'
          ).then((m) => m.InicioPerfilComponent),
      },
      { path: '', redirectTo: 'inicioPerfil', pathMatch: 'full' },
      {
        path: 'inventario',
        loadComponent: () =>
          import(
            './features/inventario/inventario.component'
          ).then((m) => m.InventarioComponent),
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import(
            './features/configuracion/pages/configuracion/configuracion.component'
          ).then((m) => m.ConfiguracionComponent),
      },
      {
        path: 'estanques',
        loadComponent: () =>
          import(
            './features/tanques/tanques.component'
          ).then((m) => m.TanquesComponent),
      },
      {
        path: 'ciclos',
        loadComponent: () =>
          import(
            './features/ciclos/ciclos.component'
          ).then((m) => m.CiclosComponent),
      },
      {
        path: 'diario',
        loadComponent: () =>
          import(
            './features/diario/diario.component'
          ).then((m) => m.DiarioComponent),
      },
      {
        path: 'empresa',
        loadComponent: () =>
          import(
            './features/empresa/empresa.component'
          ).then((m) => m.EmpresaComponent),
      },
    ],
  },
  {
    path: 'inicio',
    loadComponent: () =>
      import(
        './features/inicio/inicio.component'
      ).then((m) => m.InicioComponent),
  },
  
  {
    path: 'producto',
    loadComponent: () =>
      import(
        './features/producto/producto.component'
      ).then((m) => m.ProductoComponent),
  },
  { path: '**', redirectTo: 'login' },
];
