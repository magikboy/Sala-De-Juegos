import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

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
  maxErrors: number = 6; // Máximo de errores permitidos
  currentErrors: number = 0; // Contador de errores actuales
  statusMessage: string = '';
  hint: string = ''; // Variable para almacenar la pista
  alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getWordFromAPI();
  }

  // Nueva función para obtener la palabra desde la API
  getWordFromAPI() {
    this.http
      .get<any>('https://clientes.api.greenborn.com.ar/public-random-word')
      .subscribe((response: any) => {
        this.wordToGuess = response[0].toUpperCase(); // La API devuelve un arreglo, tomamos la primera palabra
        this.guessedWord = Array(this.wordToGuess.length).fill('_');
      });
  }

  guessLetter(letter: string) {
    // Si ya ganó o perdió, no permitir más intentos
    if (this.statusMessage) {
      return;
    }

    this.guessedLetters.push(letter);

    if (this.wordToGuess.includes(letter)) {
      for (let i = 0; i < this.wordToGuess.length; i++) {
        if (this.wordToGuess[i] === letter) {
          this.guessedWord[i] = letter;
        }
      }
      this.checkWin();
    } else {
      this.currentErrors++; // Incrementa los errores
      this.checkLose();
    }

    // Checa si permitir mostrar una pista
    this.checkForHint();
  }

  checkWin() {
    if (!this.guessedWord.includes('_')) {
      this.statusMessage = '¡Ganaste!';
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

    // Mostrar pista si solo quedan 2 errores y ha adivinado más de la mitad de las letras
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
      // Generar la pista con una de las letras que aún no ha sido adivinada
      this.hint = `Pista: Una de las letras es \"${remainingLetters[0]}\"`;
    }
  }
}
