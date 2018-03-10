import { AuthGuard } from './../core/guards/auth.guard';
import { Routes, RouterModule }  from '@angular/router';
import { Main } from './main.component';
import { ModuleWithProviders } from '@angular/core';

// noinspection TypeScriptValidateTypes

// export function loadChildren(path) { return System.import(path); };

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: 'app/main/login/login.module#LoginModule',
    pathMatch: 'full'
  },
  {
    path: 'register',
    loadChildren: 'app/main/register/register.module#RegisterModule'
  },
  {
    path: 'main',
    component: Main,
    children: [
      { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule' },
      { path: 'editors', loadChildren: './editors/editors.module#EditorsModule' },
      { path: 'components', loadChildren: './components/components.module#ComponentsModule' },
      { path: 'charts', loadChildren: './charts/charts.module#ChartsModule' },
      { path: 'ui', loadChildren: './ui/ui.module#UiModule' },
      { path: 'forms', loadChildren: './forms/forms.module#FormsModule' },
      { path: 'tables', loadChildren: './tables/tables.module#TablesModule' },
      { path: 'maps', loadChildren: './maps/maps.module#MapsModule' },
      { path: 'student', loadChildren: './student/student.module#StudentModule' },
      { path: 'role', loadChildren: './role/role.module#RoleModule' },
      { path: 'lecturer', loadChildren: './lecturer/lecturer.module#LecturerModule' },
      { path: 'quarter', loadChildren: './quarter/quarter.module#QuarterModule' },
      { path: 'project', loadChildren: './project/project.module#ProjectModule' },
      { path: 'major', loadChildren: './major/major.module#MajorModule' }
    ],
    canActivate: [AuthGuard]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);