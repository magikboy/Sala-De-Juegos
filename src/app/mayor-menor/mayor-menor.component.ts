import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { db } from '../../services/firebase.config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

@Component({
  selector: 'app-mayor-menor',
  templateUrl: './mayor-menor.component.html',
  styleUrls: ['./mayor-menor.component.css'],
})
export class MayorMenorComponent implements OnInit {
  deck: { number: number; suit: string; symbol: string }[] = [];
  visibleCard: { number: number; suit: string; symbol: string } | null = null;
  hiddenCard: { number: number; suit: string; symbol: string } | null = null;
  score: number = 0;
  lives: number = 3;
  message: string = '';
  puntajes: any[] = [];
  gameOver: boolean = false;
  isRevealing: boolean = false;

  cardOrder = [
    { number: 4, suit: 'Espada', symbol: '⚔️' },
    { number: 4, suit: 'Basto', symbol: '🪓' },
    { number: 4, suit: 'Oro', symbol: '💰' },
    { number: 4, suit: 'Copa', symbol: '🏆' },
    { number: 5, suit: 'Espada', symbol: '⚔️' },
    { number: 5, suit: 'Basto', symbol: '🪓' },
    { number: 5, suit: 'Oro', symbol: '💰' },
    { number: 5, suit: 'Copa', symbol: '🏆' },
    { number: 6, suit: 'Espada', symbol: '⚔️' },
    { number: 6, suit: 'Basto', symbol: '🪓' },
    { number: 6, suit: 'Oro', symbol: '💰' },
    { number: 6, suit: 'Copa', symbol: '🏆' },
    { number: 7, suit: 'Basto', symbol: '🪓' },
    { number: 7, suit: 'Copa', symbol: '🏆' },
    { number: 10, suit: 'Espada', symbol: '⚔️' },
    { number: 10, suit: 'Basto', symbol: '🪓' },
    { number: 10, suit: 'Oro', symbol: '💰' },
    { number: 10, suit: 'Copa', symbol: '🏆' },
    { number: 11, suit: 'Espada', symbol: '⚔️' },
    { number: 11, suit: 'Basto', symbol: '🪓' },
    { number: 11, suit: 'Oro', symbol: '💰' },
    { number: 11, suit: 'Copa', symbol: '🏆' },
    { number: 12, suit: 'Espada', symbol: '⚔️' },
    { number: 12, suit: 'Basto', symbol: '🪓' },
    { number: 12, suit: 'Oro', symbol: '💰' },
    { number: 12, suit: 'Copa', symbol: '🏆' },
    { number: 1, suit: 'Oro', symbol: '💰' },
    { number: 1, suit: 'Copa', symbol: '🏆' },
    { number: 2, suit: 'Espada', symbol: '⚔️' },
    { number: 2, suit: 'Basto', symbol: '🪓' },
    { number: 2, suit: 'Oro', symbol: '💰' },
    { number: 2, suit: 'Copa', symbol: '🏆' },
    { number: 3, suit: 'Espada', symbol: '⚔️' },
    { number: 3, suit: 'Basto', symbol: '🪓' },
    { number: 3, suit: 'Oro', symbol: '💰' },
    { number: 3, suit: 'Copa', symbol: '🏆' },
    { number: 7, suit: 'Oro', symbol: '💰' },
    { number: 7, suit: 'Espada', symbol: '⚔️' },
    { number: 1, suit: 'Basto', symbol: '🪓' },
    { number: 1, suit: 'Espada', symbol: '⚔️' },
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.startGame();
    this.loadPuntajes();
  }

  startGame() {
    this.deck = this.shuffleDeck([...this.cardOrder]);
    this.visibleCard = this.deck.pop()!;
    this.hiddenCard = this.deck.pop()!;
    this.score = 0;
    this.lives = 3;
    this.message = '';
    this.gameOver = false;
    this.isRevealing = false;
  }

  shuffleDeck(
    deck: { number: number; suit: string; symbol: string }[]
  ): { number: number; suit: string; symbol: string }[] {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  getCardRank(card: { number: number; suit: string; symbol: string }): number {
    return this.cardOrder.findIndex(
      (c) => c.number === card.number && c.suit === card.suit
    );
  }

  async guessHigher() {
    await this.makeGuess(true);
  }

  async guessLower() {
    await this.makeGuess(false);
  }

  async makeGuess(guessedHigher: boolean) {
    if (
      this.gameOver ||
      !this.hiddenCard ||
      !this.visibleCard ||
      this.isRevealing
    ) {
      return;
    }

    const visibleRank = this.getCardRank(this.visibleCard);
    const hiddenRank = this.getCardRank(this.hiddenCard);

    const isCorrect =
      (guessedHigher && hiddenRank > visibleRank) ||
      (!guessedHigher && hiddenRank < visibleRank);

    this.isRevealing = true;

    if (isCorrect) {
      this.score++;
      this.message = guessedHigher
        ? '¡Correcto! Es mayor.'
        : '¡Correcto! Es menor.';
      await this.guardarPuntaje();
    } else {
      this.lives--;
      this.message = guessedHigher
        ? '¡Incorrecto! No es mayor.'
        : '¡Incorrecto! No es menor.';
      if (this.lives === 0) {
        this.gameOver = true;
        this.message = `Juego terminado. Tu puntuación final es ${this.score}.`;
      }
    }

    // Esperar 10 segundos antes de pasar a la siguiente carta
    setTimeout(() => {
      this.updateCards();
      this.isRevealing = false;
    }, 3000);
  }

  updateCards() {
    this.visibleCard = this.hiddenCard;
    if (this.deck.length > 0) {
      this.hiddenCard = this.deck.pop()!;
    } else {
      this.hiddenCard = null;
      this.gameOver = true;
      this.message = `¡Felicidades! Has completado todas las cartas. Tu puntuación final es ${this.score}.`;
    }
  }

  async guardarPuntaje() {
    const user = this.authService.getCurrentUser();
    const usuario = user && user.email ? user.email.split('@')[0] : 'Anónimo';
    const nuevoPuntaje = this.score;
    const fecha = new Date().toLocaleString();

    const docRef = doc(db, 'PuntuacionMayor', 'puntajes');
    const docSnap = await getDoc(docRef);

    let puntajesActualizados = [];

    if (docSnap.exists()) {
      let puntajes = docSnap.data()['puntajes'] || [];
      const indiceUsuario = puntajes.findIndex(
        (p: any) => p.usuario === usuario
      );

      if (indiceUsuario !== -1) {
        puntajes[indiceUsuario].puntaje = nuevoPuntaje;
        puntajes[indiceUsuario].fecha = fecha;
      } else {
        puntajes.push({ usuario, fecha, puntaje: nuevoPuntaje });
      }

      puntajesActualizados = puntajes;
    } else {
      puntajesActualizados = [{ usuario, fecha, puntaje: nuevoPuntaje }];
    }

    await setDoc(docRef, { puntajes: puntajesActualizados });

    this.loadPuntajes();
  }

  async loadPuntajes() {
    const docRef = doc(db, 'PuntuacionMayor', 'puntajes');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      this.puntajes = docSnap.data()['puntajes'] || [];
    }
  }
}
