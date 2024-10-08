import { Component, HostListener } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'salaJuegos';
  isAuthenticated: boolean = false;
  menuOpen: boolean = false;
  isDesktop: boolean = false;

  constructor(private authService: AuthService, private router: Router) {
    // Escuchar el estado de autenticación
    this.authService.user$.subscribe((user) => {
      this.isAuthenticated = !!user;
    });
    this.checkWindowSize();
  }

  // Método para cerrar sesión
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Método para alternar el menú en móviles
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  // Verificar si está en pantalla grande o móvil
  @HostListener('window:resize', ['$event'])
  checkWindowSize() {
    this.isDesktop = window.innerWidth >= 1024;
    if (this.isDesktop) {
      this.menuOpen = false;
    }
  }
}
