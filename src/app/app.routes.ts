import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from '../app/guards/auth.guard';
import { AhorcadoComponent } from './ahorcado/ahorcado.component';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'registro',
    loadChildren: () =>
      import('./registro/registro.module').then((m) => m.RegistroModule),
  },
  {
    path: 'quien-soy',
    loadChildren: () =>
      import('./quien-soy/quien-soy.module').then((m) => m.QuienSoyModule),
    canActivate: [AuthGuard],
  },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'mayor-menor',
    loadChildren: () =>
      import('./mayor-menor/mayor-menor.module').then(
        (m) => m.MayorMenorModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'preguntados',
    loadChildren: () =>
      import('./preguntados/preguntados.module').then(
        (m) => m.PreguntadosModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'tetris',
    loadChildren: () =>
      import('./tetris/tetris.module').then((m) => m.TetrisModule),
    canActivate: [AuthGuard],
  },
  { path: 'ahorcado', component: AhorcadoComponent, canActivate: [AuthGuard] },
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then((m) => m.ChatModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'encuesta',
    loadChildren: () => import('./encuesta/encuesta-routing.module').then(m => m.EncuestaRoutingModule),
    canActivate: [AuthGuard],
  },
];