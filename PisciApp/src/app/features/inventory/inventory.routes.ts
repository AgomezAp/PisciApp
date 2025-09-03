import { Routes } from '@angular/router';


import { ListComponent } from './pages/list/list.component';
import { CreateComponent } from './pages/create/create.component';
import { DetailComponent } from './pages/detail/detail.component';
import { AuthGuard } from '../../core/guards/auth.guard';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: ListComponent },
      { path: 'create', component: CreateComponent }, 
      { path: ':id', component: DetailComponent } 
    ]
  }
];