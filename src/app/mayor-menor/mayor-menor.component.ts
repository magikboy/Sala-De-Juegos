import { Component } from '@angular/core';
import { AuthService } from '../auth.service'; // Importa el AuthService para obtener información del usuario
import { db } from '../../services/firebase.config'; // Importa la configuración de Firestore
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';

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
  puntajes: any[] = []; // Arreglo para almacenar puntajes desde Firestore

  // Jerarquía de las cartas del truco, de menor a mayor
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

  constructor(private authService: AuthService) {
    this.startGame();
    this.loadPuntajes(); // Cargar puntajes al inicio
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

  // Adivinar si la carta es mayor
  async guessHigher() {
    if (!this.nextCard || !this.currentCard) {
      this.message = 'No quedan más cartas';
      return;
    }

    const currentRank = this.getCardRank(this.currentCard);
    const nextRank = this.getCardRank(this.nextCard);

    if (nextRank > currentRank) {
      this.score++;
      this.message = '¡Correcto! Es mayor.';
      await this.guardarPuntaje(); // Guardar puntaje cada vez que gana un punto
    } else {
      this.message = '¡Incorrecto! No es mayor.';
    }

    this.updateCards();
  }

  // Adivinar si la carta es menor
  async guessLower() {
    if (!this.nextCard || !this.currentCard) {
      this.message = 'No quedan más cartas';
      return;
    }

    const currentRank = this.getCardRank(this.currentCard);
    const nextRank = this.getCardRank(this.nextCard);

    if (nextRank < currentRank) {
      this.score++;
      this.message = '¡Correcto! Es menor.';
      await this.guardarPuntaje(); // Guardar puntaje cada vez que gana un punto
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

  // Función para guardar el puntaje en Firestore
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

      // Verificar si el usuario ya tiene un puntaje registrado
      const indiceUsuario = puntajes.findIndex(
        (p: any) => p.usuario === usuario
      );

      if (indiceUsuario !== -1) {
        // El usuario ya tiene un puntaje, actualizar el puntaje en tiempo real
        puntajes[indiceUsuario].puntaje = nuevoPuntaje; // Actualizar con el puntaje actual
        puntajes[indiceUsuario].fecha = fecha; // Actualizar la fecha también
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
    const docRef = doc(db, 'PuntuacionMayor', 'puntajes');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      this.puntajes = docSnap.data()['puntajes'] || [];
    }
  }
}
