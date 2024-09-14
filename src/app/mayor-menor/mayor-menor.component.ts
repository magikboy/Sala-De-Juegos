import { Component } from '@angular/core';

@Component({
  selector: 'app-mayor-menor',
  templateUrl: './mayor-menor.component.html',
  styleUrls: ['./mayor-menor.component.css'],
})
export class MayorMenorComponent {
  deck: { number: number; suit: string; symbol: string }[] = [];
  currentCard: { number: number; suit: string; symbol: string } | null = null;
  nextCard: { number: number; suit: string; symbol: string } | null = null;
  score: number = 0;
  message: string = '';

  // Jerarquía de las cartas del truco, de menor a mayor con símbolos Unicode
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

  constructor() {
    this.startGame();
  }

  startGame() {
    this.deck = this.shuffleDeck([...this.cardOrder]);
    this.currentCard = this.deck.pop()!;
    this.nextCard = this.deck.pop()!;
    this.score = 0;
    this.message = '';
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

  guessHigher() {
    if (!this.nextCard || !this.currentCard) {
      this.message = 'No quedan más cartas';
      return;
    }

    const currentRank = this.getCardRank(this.currentCard);
    const nextRank = this.getCardRank(this.nextCard);

    if (nextRank > currentRank) {
      this.score++;
      this.message = '¡Correcto! Es mayor.';
    } else {
      this.message = '¡Incorrecto! No es mayor.';
    }

    this.updateCards();
  }

  guessLower() {
    if (!this.nextCard || !this.currentCard) {
      this.message = 'No quedan más cartas';
      return;
    }

    const currentRank = this.getCardRank(this.currentCard);
    const nextRank = this.getCardRank(this.nextCard);

    if (nextRank < currentRank) {
      this.score++;
      this.message = '¡Correcto! Es menor.';
    } else {
      this.message = '¡Incorrecto! No es menor.';
    }

    this.updateCards();
  }

  updateCards() {
    this.currentCard = this.nextCard;
    if (this.deck.length > 0) {
      this.nextCard = this.deck.pop()!;
    } else {
      this.nextCard = null;
      this.message = 'Juego terminado, no quedan más cartas.';
    }
  }
}
