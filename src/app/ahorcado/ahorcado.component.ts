import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Importa HttpClient y HttpClientModule
import { CommonModule } from '@angular/common'; // Importa CommonModule para usar directivas como *ngIf y *ngFor

@Component({
  selector: 'app-ahorcado',
  standalone: true, // Indica que el componente es standalone
  imports: [CommonModule, HttpClientModule], // Importa HttpClientModule y CommonModule
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
  allWords: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getAllWords();
  }

  getAllWords() {
    this.http
      .get<string[]>('https://random-word-api.herokuapp.com/all')
      .subscribe((words: string[]) => {
        this.allWords = words.map((word) => word.toUpperCase());
        this.selectRandomWord();
      });
  }

  selectRandomWord() {
    const randomIndex = Math.floor(Math.random() * this.allWords.length);
    this.wordToGuess = this.allWords[randomIndex];
    this.guessedWord = Array(this.wordToGuess.length).fill('_');
  }

  guessLetter(letter: string) {
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
      this.hint = ''; // Si no se cumplen las condiciones, no generar pista
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
}
