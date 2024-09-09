import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { FormsModule } from '@angular/forms'; // Importar FormsModule
import { CommonModule } from '@angular/common'; // Importar CommonModule
import { auth, db } from '../../services/firebase.config'; // Importar Firebase desde tu configuración

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule] // Asegurar que FormsModule y CommonModule están importados
})
export class LoginComponent {
  email: string = ''; // Datos de email
  password: string = ''; // Datos de contraseña
  errorMessage: string = ''; // Mensaje de error

  constructor(private router: Router) {}

  // Función para loguearse
  async login() {
    try {
      // Autenticar con Firebase usando el email y contraseña
      const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
      // Redirigir al home tras login exitoso
      this.router.navigate(['/home']);
    } catch (error:any) {
      // Mostrar mensaje de error al usuario
      this.errorMessage = 'Error al iniciar sesión. Por favor, revisa tus credenciales.';
      console.log('Login failed', error.code); // Manejo de error en consola
    }
  }

  // Función para registrar el log de acceso en Firestore
  async logUserLogin(email: string | null) {
    const loginLog = {
      email: email,
      date: new Date().toISOString(), // Fecha de ingreso actual
    };
    // Guardar log en Firestore
    await setDoc(doc(db, 'loginLogs', email!), loginLog);
  }

  // Función para acceso rápido con usuarios predefinidos
  quickLogin(userType: string) {
    if (userType === 'admin') {
      this.email = 'admin@ejemplo.com'; // Datos de admin predefinidos
      this.password = 'admin123';
    } else if (userType === 'user') {
      this.email = 'usuario@ejemplo.com'; // Datos de usuario predefinidos
      this.password = 'usuario123';
    }
  }

  // Redirigir al registro si el usuario no tiene cuenta
  redirectToRegister() {
    this.router.navigate(['/registro']); // Ruta al componente de registro
  }
}
