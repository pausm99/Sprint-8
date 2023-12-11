import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    title: 'Home',
    loadComponent: () => import('./components/home/home.component').then(c => c.HomeComponent) },
  {
    path: 'chart',
    title: 'Chart',
    loadComponent: () => import('./components/chart/chart.component').then(c => c.ChartComponent)
  },
  {
    path: 'calendar',
    title: 'Calendar',
    loadComponent: () => import('./components/calendar/calendar.component').then(c => c.CalendarComponent)
  },
  {
    path: 'map',
    title: 'Map',
    loadComponent: () => import('./components/map/map.component').then(c => c.MapComponent)
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/home'
  }

];
