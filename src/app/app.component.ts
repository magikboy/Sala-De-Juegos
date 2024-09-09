import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router'; // Importa Router
import { CommonModule } from '@angular/common'; // Importar CommonModule para usar *ngIf
import { AuthService } from './auth.service'; // Importa el servicio de autenticación

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule], // Agregar CommonModule
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'salaJuegos';
  isAuthenticated: boolean = false;

  constructor(private authService: AuthService, private router: Router) { // Inyecta Router
    // Escuchar el estado de autenticación
    this.authService.user$.subscribe((user) => {
      this.isAuthenticated = !!user;
    });
  }

  // Método para cerrar sesión
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']); // Redirigir a login después de cerrar sesión
  }
}
