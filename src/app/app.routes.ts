import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { QuienSoyComponent } from './quien-soy/quien-soy.component';
import { HomeComponent } from './home/home.component';
import { RegistroComponent } from './registro/registro.component';
import { AuthGuard } from '../app/guards/auth.guard';
import { MayorMenorComponent } from './mayor-menor/mayor-menor.component';
import { PreguntadosComponent } from './preguntados/preguntados.component';
import { TetrisComponent } from './tetris/tetris.component';
import { AhorcadoComponent } from './ahorcado/ahorcado.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'quien-soy', component: QuienSoyComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'mayor-menor', component: MayorMenorComponent ,canActivate: [AuthGuard]},
  { path: 'preguntados', component: PreguntadosComponent ,canActivate: [AuthGuard]},
  { path: 'tetris', component: TetrisComponent ,canActivate: [AuthGuard]},
  { path: 'ahorcado', component: AhorcadoComponent ,canActivate: [AuthGuard]},
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then((m) => m.ChatModule),
    canActivate: [AuthGuard],
  },
];
