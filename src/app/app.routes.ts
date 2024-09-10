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
  { path: 'mayor-menor', component: MayorMenorComponent },
  { path: 'preguntados', component: PreguntadosComponent },
  { path: 'tetris', component: TetrisComponent },
  { path: 'ahorcado', component: AhorcadoComponent },
  { path: 'chat', loadChildren: () => import('./chat/chat.module').then(m => m.ChatModule), canActivate: [AuthGuard] },
];
