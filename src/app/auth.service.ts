import { Injectable } from '@angular/core';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase.config'; // Importa Firebase Auth desde tu configuración
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user = new BehaviorSubject<User | null>(null); // Estado del usuario
  public user$ = this.user.asObservable(); // Observable para acceder al estado

  constructor() {
    // Escuchar el estado de autenticación de Firebase
    onAuthStateChanged(auth, (user) => {
      this.user.next(user);
    });
  }

  // Método para iniciar sesión
  login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Método para registrarse
  register(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  // Método para cerrar sesión
  logout() {
    return signOut(auth);
  }

  // Método para verificar si el usuario está autenticado
  isLoggedIn(): boolean {
    return this.user.value !== null;
  }
}
