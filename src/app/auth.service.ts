import { Injectable } from '@angular/core';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { auth } from '../services/firebase.config';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Observa el estado del usuario autenticado
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor() {
    // Escucha el estado de autenticación de Firebase en tiempo real
    onAuthStateChanged(auth, (user) => {
      this.userSubject.next(user); // Actualizar el estado del usuario
    });
  }

  //iniciar sesión con email y contraseña
  login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        this.userSubject.next(userCredential.user); // Actualiza el estado del usuario al iniciar sesión
      })
      .catch(error => {
        console.error('Error al iniciar sesión:', error);
        throw error;
      });
  }

  //registrarse con email y contraseña
  register(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        this.userSubject.next(userCredential.user); // Actualiza el estado del usuario tras registrarse
      })
      .catch(error => {
        console.error('Error al registrarse:', error);
        throw error;
      });
  }

  // Método para cerrar sesión
  logout() {
    return signOut(auth)
      .then(() => {
        this.userSubject.next(null); // Limpia el usuario tras cerrar sesión
      })
      .catch(error => {
        console.error('Error al cerrar sesión:', error);
        throw error;
      });
  }

  // Método para verificar si el usuario está autenticado
  isLoggedIn(): boolean {
    return this.userSubject.value !== null;
  }

  // Obtener el usuario actual
  getCurrentUser(): User | null {
    return this.userSubject.value;
  }
}
