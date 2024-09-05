import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Juego {
  titulo: string;
  descripcion: string;
  imagen: string;
}

@Component({
  selector: 'app-quien-soy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quien-soy.component.html',
  styleUrls: ['./quien-soy.component.css']
})
export class QuienSoyComponent {
  juegos: Juego[] = [
    {
      titulo: 'Ahorcado',
      descripcion: 'Ahorcado es un juego clásico en el que debes adivinar una palabra antes de que el dibujo del ahorcado se complete.',
      imagen: 'assets/img/ahorcado.png'
    },
    {
      titulo: 'Mayor o Menor',
      descripcion: 'Mayor o Menor es un juego de cartas donde debes adivinar si la próxima carta será mayor o menor que la actual.',
      imagen: 'assets/img/H&L.png'
    },
    {
      titulo: 'Preguntados',
      descripcion: 'Preguntados es un juego de preguntas y respuestas en el que compites para ver quién sabe más sobre diferentes temas.',
      imagen: 'assets/img/Preguntados.png'
    },
    {
      titulo: 'Tetris',
      descripcion: 'Tetris es un juego de bloques en el que debes encajar las piezas que caen en una cuadrícula.',
      imagen: 'assets/img/Tetris.jpg'
    }
  ];

  juegoActual: number = 0;

  anteriorJuego() {
    this.juegoActual = (this.juegoActual > 0) ? this.juegoActual - 1 : this.juegos.length - 1;
  }

  siguienteJuego() {
    this.juegoActual = (this.juegoActual < this.juegos.length - 1) ? this.juegoActual + 1 : 0;
  }
}