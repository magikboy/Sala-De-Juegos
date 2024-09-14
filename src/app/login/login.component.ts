import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase.config';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router) {}

  async login() {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        this.email,
        this.password
      );
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.errorMessage =
        'Error al iniciar sesión. Por favor, revisa tus credenciales.';
      console.log('Login failed', error.code);
    }
  }

  async logUserLogin(email: string | null) {
    const loginLog = {
      email: email,
      date: new Date().toISOString(),
    };
    await setDoc(doc(db, 'loginLogs', email!), loginLog);
  }

  quickLogin(userType: string) {
    if (userType === 'admin') {
      this.email = 'admin@ejemplo.com';
      this.password = 'admin123';
    } else if (userType === 'user') {
      this.email = 'usuario@ejemplo.com';
      this.password = 'usuario123';
    }
  }

  redirectToRegister() {
    this.router.navigate(['/registro']);
  }
}
