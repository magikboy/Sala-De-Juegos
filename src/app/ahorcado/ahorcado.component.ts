// src/app/ahorcado/ahorcado.component.ts

import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service'; // Asegúrate de que la ruta es correcta
import { db } from '../../services/firebase.config'; // Importa la configuración de Firestore
import { doc, getDoc, setDoc } from 'firebase/firestore';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './ahorcado.component.html',
  styleUrls: ['./ahorcado.component.css'],
})
export class AhorcadoComponent {
  wordToGuessOriginal: string = '';
  wordToGuessNormalized: string = '';
  guessedWord: string[] = [];
  guessedLetters: string[] = [];
  maxErrors: number = 6;
  currentErrors: number = 0;
  statusMessage: string = '';
  hint: string = '';
  alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  puntos: number = 100;
  puntajes: any[] = [];
  gameOver: boolean = false;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.getWordFromAPI();
    this.loadPuntajes();
  }

  // Función para eliminar acentos de una cadena
  removeAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  getWordFromAPI() {
    this.http
      .get<any>('https://clientes.api.greenborn.com.ar/public-random-word')
      .subscribe((response: any) => {
        if (response && response.length > 0) {
          this.wordToGuessOriginal = response[0].toUpperCase();
          this.wordToGuessNormalized = this.removeAccents(this.wordToGuessOriginal);
          this.guessedWord = Array(this.wordToGuessOriginal.length).fill('_');
          // Resetear otras variables al obtener una nueva palabra
          this.guessedLetters = [];
          this.currentErrors = 0;
          this.statusMessage = '';
          this.hint = '';
          this.gameOver = false;
        } else {
          // Manejar el caso en que la API no devuelve una palabra válida
          this.statusMessage = 'Error al obtener la palabra. Inténtalo de nuevo.';
        }
      }, (error) => {
        console.error('Error al llamar a la API:', error);
        this.statusMessage = 'Error al obtener la palabra. Inténtalo de nuevo.';
      });
  }

  async guessLetter(letter: string) {
    if (this.gameOver) return;

    // Evitar que se ingrese la misma letra más de una vez
    if (this.guessedLetters.includes(letter)) return;

    this.guessedLetters.push(letter);

    const normalizedLetter = this.removeAccents(letter);

    if (this.wordToGuessNormalized.includes(normalizedLetter)) {
      for (let i = 0; i < this.wordToGuessNormalized.length; i++) {
        if (this.wordToGuessNormalized[i] === normalizedLetter) {
          this.guessedWord[i] = this.wordToGuessOriginal[i];
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
      this.gameOver = true;
      this.guardarPuntaje();
    }
  }

  checkLose() {
    if (this.currentErrors >= this.maxErrors) {
      this.statusMessage = `¡Perdiste! La palabra era "${this.wordToGuessOriginal}"`;
      this.gameOver = true;
    }
  }

  checkForHint() {
    const guessedLettersCount = this.guessedWord.filter(
      (letter) => letter !== '_'
    ).length;
    const totalLetters = this.wordToGuessOriginal.length;

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
    const remainingLetters = this.wordToGuessOriginal
      .split('')
      .filter((letter) => !this.guessedLetters.includes(this.removeAccents(letter)));

    if (remainingLetters.length > 0) {
      // Seleccionar una letra aleatoria de las restantes para la pista
      const randomIndex = Math.floor(Math.random() * remainingLetters.length);
      this.hint = `Pista: Una de las letras es "${remainingLetters[randomIndex]}"`;
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

  // Función para reiniciar el juego
  restartGame() {
    this.wordToGuessOriginal = '';
    this.wordToGuessNormalized = '';
    this.guessedWord = [];
    this.guessedLetters = [];
    this.currentErrors = 0;
    this.statusMessage = '';
    this.hint = '';
    this.gameOver = false;
    this.getWordFromAPI();
  }
}
