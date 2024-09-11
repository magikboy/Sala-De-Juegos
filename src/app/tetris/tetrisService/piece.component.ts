import { COLORS, SHAPES, BLOCK_SIZE } from './constants';

export interface IPiece {
  x: number;
  y: number;
  color: string;
  shape: number[][];
}

export class Piece implements IPiece {
  x: number = 0;
  y: number = 0;
  color: string = '';
  shape: number[][] = [];

  constructor(private ctx: CanvasRenderingContext2D) {
    this.spawn();
  }

  spawn() {
    const typeId = this.randomizeTetrominoType(COLORS.length - 1);
    this.shape = SHAPES[typeId];
    this.color = COLORS[typeId];
    this.x = typeId === 4 ? 4 : 3;
    this.y = 0;
  }

  draw() {
    this.ctx.fillStyle = this.color;
    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.ctx.fillRect(this.x + x, this.y + y, 1, 1);
          this.ctx.strokeStyle = 'black';
          this.ctx.lineWidth = 0.05;
          this.ctx.strokeRect(this.x + x, this.y + y, 1, 1);
        }
      });
    });
  }

  drawNext(ctxNext: CanvasRenderingContext2D) {
    // se limpia canvas antes de dibujar la siguiente pieza
    ctxNext.clearRect(0, 0, ctxNext.canvas.width, ctxNext.canvas.height);

    // Tamaño del bloque y del canvas
    const previewBlockSize = BLOCK_SIZE * 0.8;
    ctxNext.canvas.width = 4 * previewBlockSize;
    ctxNext.canvas.height = 4 * previewBlockSize;

    // Calcula el tamaño de la pieza
    const pieceWidth = this.shape[0].length;
    const pieceHeight = this.shape.length;

    // el desplazamiento para centrar la pieza en el canvas
    const xOffset = Math.floor((4 - pieceWidth) / 2);
    const yOffset = Math.floor((4 - pieceHeight) / 2);

    // Dibujar la pieza centrada
    ctxNext.fillStyle = this.color;
    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          // Dibuja cada bloque de la pieza con el desplazamiento
          ctxNext.fillRect(
            (x + xOffset) * previewBlockSize,
            (y + yOffset) * previewBlockSize,
            previewBlockSize,
            previewBlockSize
          );
          // Dibuja el borde alrededor de cada bloque
          ctxNext.strokeStyle = 'black';
          ctxNext.lineWidth = 2; // Grosor del borde
          ctxNext.strokeRect(
            (x + xOffset) * previewBlockSize,
            (y + yOffset) * previewBlockSize,
            previewBlockSize,
            previewBlockSize
          );
        }
      });
    });
  }

  move(p: IPiece) {
    this.x = p.x;
    this.y = p.y;
    this.shape = p.shape;
  }

  randomizeTetrominoType(noOfTypes: number): number {
    return Math.floor(Math.random() * noOfTypes + 1);
  }
}
