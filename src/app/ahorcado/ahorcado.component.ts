import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service'; // Reutilizando el AuthService
import { db } from '../../services/firebase.config'; // Importa la configuración de Firestore
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './ahorcado.component.html',
  styleUrls: ['./ahorcado.component.css'],
})
export class AhorcadoComponent {
  wordToGuess: string = '';
  guessedWord: string[] = [];
  guessedLetters: string[] = [];
  maxErrors: number = 6;
  currentErrors: number = 0;
  statusMessage: string = '';
  hint: string = '';
  alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  puntos: number = 100;
  puntajes: any[] = [];

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.getWordFromAPI();
    this.loadPuntajes();
  }

  getWordFromAPI() {
    this.http
      .get<any>('https://clientes.api.greenborn.com.ar/public-random-word')
      .subscribe((response: any) => {
        this.wordToGuess = response[0].toUpperCase();
        this.guessedWord = Array(this.wordToGuess.length).fill('_');
      });
  }

  async guessLetter(letter: string) {
    if (this.statusMessage) return;

    this.guessedLetters.push(letter);

    if (this.wordToGuess.includes(letter)) {
      for (let i = 0; i < this.wordToGuess.length; i++) {
        if (this.wordToGuess[i] === letter) {
          this.guessedWord[i] = letter;
        }
      }
      this.checkWin();
    } else {
      this.currentErrors++;
      this.checkLose();
    }

    this.checkForHint();
  }

  checkWin() {
    if (!this.guessedWord.includes('_')) {
      this.statusMessage = '¡Ganaste!';
      this.guardarPuntaje();
    }
  }

  checkLose() {
    if (this.currentErrors >= this.maxErrors) {
      this.statusMessage = `¡Perdiste! La palabra era ${this.wordToGuess}`;
    }
  }

  checkForHint() {
    const guessedLettersCount = this.guessedWord.filter(
      (letter) => letter !== '_'
    ).length;
    const totalLetters = this.wordToGuess.length;

    if (
      this.currentErrors === this.maxErrors - 2 &&
      guessedLettersCount > totalLetters / 2
    ) {
      this.generateHint();
    } else {
      this.hint = '';
    }
  }

  generateHint() {
    const remainingLetters = this.wordToGuess
      .split('')
      .filter((letter) => !this.guessedLetters.includes(letter));

    if (remainingLetters.length > 0) {
      this.hint = `Pista: Una de las letras es \"${remainingLetters[0]}\"`;
    }
  }

  // Función para guardar el puntaje en Firestore y sumar si el usuario ya tiene un puntaje
  async guardarPuntaje() {
    const user = this.authService.getCurrentUser();
    const usuario = user && user.email ? user.email.split('@')[0] : 'Anónimo';
    const nuevoPuntaje = this.puntos;
    const fecha = new Date().toLocaleString();

    const docRef = doc(db, 'PuntuacionAhorcado', 'puntajes');
    const docSnap = await getDoc(docRef);

    let puntajesActualizados = [];

    if (docSnap.exists()) {
      let puntajes = docSnap.data()['puntajes'] || [];

      // Verificar si el usuario ya tiene un puntaje registrado
      const indiceUsuario = puntajes.findIndex(
        (p: any) => p.usuario === usuario
      );

      if (indiceUsuario !== -1) {
        // El usuario ya tiene un puntaje, sumar el nuevo puntaje al existente
        puntajes[indiceUsuario].puntaje += nuevoPuntaje;
        puntajes[indiceUsuario].fecha = fecha; // Actualizamos la fecha también
      } else {
        // El usuario no tiene un puntaje registrado, agregar un nuevo registro
        puntajes.push({ usuario, fecha, puntaje: nuevoPuntaje });
      }

      puntajesActualizados = puntajes;
    } else {
      // Si no existe el documento, crear uno nuevo con el puntaje actual
      puntajesActualizados = [{ usuario, fecha, puntaje: nuevoPuntaje }];
    }

    // Guardar los puntajes actualizados en Firestore
    await setDoc(docRef, { puntajes: puntajesActualizados });

    this.loadPuntajes(); // Actualiza la lista de puntajes después de guardar
  }

  // Función para cargar los puntajes desde Firestore
  async loadPuntajes() {
    const docRef = doc(db, 'PuntuacionAhorcado', 'puntajes');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      this.puntajes = docSnap.data()['puntajes'] || [];
    }
  }
}
