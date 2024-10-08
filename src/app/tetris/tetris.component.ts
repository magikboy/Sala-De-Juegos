import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  HostListener,
} from '@angular/core';
import {
  COLS,
  BLOCK_SIZE,
  ROWS,
  COLORS,
  LINES_PER_LEVEL,
  LEVEL,
  POINTS,
  KEY,
} from '../tetris/tetrisService/constants';
import { Piece, IPiece } from '../tetris/tetrisService/piece.component';
import { GameService } from '../tetris/tetrisService/game.service';
import { db } from '../../services/firebase.config'; // Asegúrate de tener la configuración de Firebase
import { AuthService } from '../auth.service'; // Servicio de autenticación
import { doc, getDoc, setDoc } from 'firebase/firestore';

@Component({
  selector: 'app-tetris',
  templateUrl: './tetris.component.html',
  styleUrls: ['./tetris.component.css'],
  providers: [GameService],
})
export class TetrisComponent implements OnInit {
  @ViewChild('board', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('next', { static: true })
  canvasNext!: ElementRef<HTMLCanvasElement>;
  ctx!: CanvasRenderingContext2D;
  ctxNext!: CanvasRenderingContext2D;
  board: number[][] = [];
  piece!: Piece;
  next!: Piece;
  requestId!: number;
  time!: { start: number; elapsed: number; level: number };
  points = 0;
  lines = 0;
  level = 0;
  puntajes: any[] = []; // Puntajes obtenidos de Firestore
  moves: { [key: number]: (p: IPiece) => IPiece } = {
    [KEY.LEFT]: (p: IPiece): IPiece => ({ ...p, x: p.x - 1 }),
    [KEY.RIGHT]: (p: IPiece): IPiece => ({ ...p, x: p.x + 1 }),
    [KEY.DOWN]: (p: IPiece): IPiece => ({ ...p, y: p.y + 1 }),
    [KEY.SPACE]: (p: IPiece): IPiece => ({ ...p, y: p.y + 1 }),
    [KEY.UP]: (p: IPiece): IPiece => this.service.rotate(p),
  };

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === KEY.ESC) {
      this.gameOver();
    } else if (this.moves[event.keyCode]) {
      event.preventDefault();
      let p = this.moves[event.keyCode](this.piece);
      if (event.keyCode === KEY.SPACE) {
        while (this.service.valid(p, this.board)) {
          this.points += POINTS.HARD_DROP;
          this.piece.move(p);
          p = this.moves[KEY.DOWN](this.piece);
        }
      } else if (this.service.valid(p, this.board)) {
        this.piece.move(p);
        if (event.keyCode === KEY.DOWN) {
          this.points += POINTS.SOFT_DROP;
        }
      }
    }
  }

  constructor(private service: GameService, private authService: AuthService) {}

  ngOnInit() {
    this.initBoard();
    this.initNext();
    this.resetGame();
    this.loadPuntajes(); // Cargar los puntajes cuando se inicie el juego
  }

  // Función para guardar el puntaje en Firestore
  async guardarPuntaje() {
    const user = this.authService.getCurrentUser();
    const usuario = user && user.email ? user.email.split('@')[0] : 'Anónimo';
    const nuevoPuntaje = this.points;
    const fecha = new Date().toLocaleString();

    const docRef = doc(db, 'PuntajesTetris', 'puntajes');
    const docSnap = await getDoc(docRef);

    let puntajesActualizados = [];

    if (docSnap.exists()) {
      let puntajes = docSnap.data()['puntajes'] || [];

      // Verificar si el usuario ya tiene un puntaje registrado
      const indiceUsuario = puntajes.findIndex(
        (p: any) => p.usuario === usuario
      );

      if (indiceUsuario !== -1) {
        // El usuario ya tiene un puntaje, actualizarlo
        puntajes[indiceUsuario].puntaje = nuevoPuntaje;
        puntajes[indiceUsuario].fecha = fecha;
      } else {
        // Si no, agregar un nuevo registro
        puntajes.push({ usuario, fecha, puntaje: nuevoPuntaje });
      }

      puntajesActualizados = puntajes;
    } else {
      // Si no existe el documento, crear uno nuevo con el puntaje actual
      puntajesActualizados = [{ usuario, fecha, puntaje: nuevoPuntaje }];
    }

    // Guardar los puntajes actualizados en Firestore
    await setDoc(docRef, { puntajes: puntajesActualizados });

    this.loadPuntajes(); // Actualizar la lista de puntajes después de guardar
  }

  // Función para cargar los puntajes desde Firestore
  async loadPuntajes() {
    const docRef = doc(db, 'PuntajesTetris', 'puntajes');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      this.puntajes = docSnap.data()['puntajes'] || [];
    }
  }

  initBoard() {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.ctx.canvas.width = COLS * BLOCK_SIZE;
    this.ctx.canvas.height = ROWS * BLOCK_SIZE;
    this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
  }

  initNext() {
    this.ctxNext = this.canvasNext.nativeElement.getContext('2d')!;
    this.ctxNext.canvas.width = 4 * BLOCK_SIZE;
    this.ctxNext.canvas.height = 4 * BLOCK_SIZE;
    this.ctxNext.scale(BLOCK_SIZE, BLOCK_SIZE);
  }

  play() {
    this.resetGame();
    this.next = new Piece(this.ctx);
    this.piece = new Piece(this.ctx);
    this.next.drawNext(this.ctxNext);
    this.time.start = performance.now();
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
    }
    this.animate();
  }

  resetGame() {
    this.points = 0;
    this.lines = 0;
    this.level = 0;
    this.board = this.getEmptyBoard();
    this.time = { start: 0, elapsed: 0, level: LEVEL[this.level] };
  }

  animate(now = 0) {
    this.time.elapsed = now - this.time.start;
    if (this.time.elapsed > this.time.level) {
      this.time.start = now;
      if (!this.drop()) {
        this.gameOver(); // Llamar a gameOver cuando el juego termine
        return;
      }
    }
    this.draw();
    this.requestId = requestAnimationFrame(this.animate.bind(this));
  }

  draw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.piece.draw();
    this.drawBoard();
  }

  drop(): boolean {
    let p = this.moves[KEY.DOWN](this.piece);
    if (this.service.valid(p, this.board)) {
      this.piece.move(p);
    } else {
      this.freeze();
      this.clearLines();
      if (this.piece.y === 0) {
        return false;
      }
      this.piece = this.next;
      this.next = new Piece(this.ctx);
      this.next.drawNext(this.ctxNext);
    }
    return true;
  }

  clearLines() {
    let lines = 0;
    this.board.forEach((row, y) => {
      if (row.every((value) => value !== 0)) {
        lines++;
        this.board.splice(y, 1);
        this.board.unshift(Array(COLS).fill(0));
      }
    });
    if (lines > 0) {
      this.points += this.service.getLinesClearedPoints(lines, this.level);
      this.lines += lines;
      if (this.lines >= LINES_PER_LEVEL) {
        this.level++;
        this.lines -= LINES_PER_LEVEL;
        this.time.level = LEVEL[this.level];
      }
    }
  }

  freeze() {
    this.piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.board[y + this.piece.y][x + this.piece.x] = value;
        }
      });
    });
  }

  drawBoard() {
    this.board.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.ctx.fillStyle = COLORS[value];
          this.ctx.fillRect(x, y, 1, 1);
          this.ctx.strokeStyle = 'black';
          this.ctx.lineWidth = 0.05;
          this.ctx.strokeRect(x, y, 1, 1);
        }
      });
    });
  }

  // Modificar gameOver para guardar el puntaje
  async gameOver() {
    cancelAnimationFrame(this.requestId);
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(1, 3, 8, 1.2);
    this.ctx.font = '1px Arial';
    this.ctx.fillStyle = 'red';
    this.ctx.fillText('GAME OVER', 1.8, 4);

    // Guardar el puntaje cuando el juego termina
    await this.guardarPuntaje();
  }

  getEmptyBoard(): number[][] {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  }

  moveLeft() {
    const p = this.moves[KEY.LEFT](this.piece);
    if (this.service.valid(p, this.board)) {
      this.piece.move(p);
    }
  }

  moveRight() {
    const p = this.moves[KEY.RIGHT](this.piece);
    if (this.service.valid(p, this.board)) {
      this.piece.move(p);
    }
  }

  rotatePiece() {
    const p = this.moves[KEY.UP](this.piece);
    if (this.service.valid(p, this.board)) {
      this.piece.move(p);
    }
  }

  moveDown() {
    const p = this.moves[KEY.DOWN](this.piece);
    if (this.service.valid(p, this.board)) {
      this.piece.move(p);
      this.points += POINTS.SOFT_DROP;
    }
  }
}
