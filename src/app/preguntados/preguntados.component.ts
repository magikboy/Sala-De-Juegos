import { Component, OnInit } from '@angular/core';
import { PreguntadosService } from './services/preguntados.service';

@Component({
  selector: 'app-preguntados',
  templateUrl: './preguntados.component.html',
  styleUrls: ['./preguntados.component.css'],
  providers: [PreguntadosService],
})
export class PreguntadosComponent implements OnInit {
  question: string = '';
  correctAnswer: string = '';
  options: string[] = [];
  score: number = 0;
  loading: boolean = true;
  timeLeft: number = 10;
  progress: number = 100;
  timer: any;
  currentQuestionIndex: number = 0;
  imageUrl: string = '';
  answered: boolean = false;
  selectedOption: string | null = null;

  questions = [
    {
      question: '¿Cuál es el planeta más grande del sistema solar?',
      correctAnswer: 'Júpiter',
      options: ['Júpiter', 'Marte', 'Tierra', 'Venus'],
      imageQuery: 'Planet',
    },
    {
      question: '¿En qué año llegó el hombre a la luna?',
      correctAnswer: '1969',
      options: ['1969', '1972', '1965', '1958'],
      imageQuery: 'moon landing',
    },
    {
      question: '¿Quién pintó la Mona Lisa?',
      correctAnswer: 'Leonardo da Vinci',
      options: [
        'Leonardo da Vinci',
        'Pablo Picasso',
        'Vincent van Gogh',
        'Claude Monet',
      ],
      imageQuery: 'Mona Lisa',
    },
    {
      question: '¿Cuál es el río más largo del mundo?',
      correctAnswer: 'Nilo',
      options: ['Nilo', 'Amazonas', 'Yangtsé', 'Misisipi'],
      imageQuery: 'Nile river',
    },
    {
      question: '¿Cuál es el animal más rápido del mundo?',
      correctAnswer: 'Guepardo',
      options: ['Guepardo', 'Águila', 'Tiburón', 'León'],
      imageQuery: 'cheetah running',
    },
    {
      question: '¿Cuál es el metal más caro del mundo?',
      correctAnswer: 'Rodio',
      options: ['Rodio', 'Oro', 'Platino', 'Paladio'],
      imageQuery: 'metal',
    },
    {
      question: "¿Quién escribió 'Cien años de soledad'?",
      correctAnswer: 'Gabriel García Márquez',
      options: [
        'Gabriel García Márquez',
        'Mario Vargas Llosa',
        'Jorge Luis Borges',
        'Carlos Fuentes',
      ],
      imageQuery: 'book',
    },
    {
      question: '¿En qué continente se encuentra el desierto del Sahara?',
      correctAnswer: 'África',
      options: ['África', 'Asia', 'América', 'Australia'],
      imageQuery: 'Sahara desert',
    },
    {
      question: '¿Cuál es la capital de Japón?',
      correctAnswer: 'Tokio',
      options: ['Tokio', 'Kyoto', 'Osaka', 'Hiroshima'],
      imageQuery: 'Tokyo',
    },
    {
      question: '¿Qué elemento químico tiene el símbolo H?',
      correctAnswer: 'Hidrógeno',
      options: ['Hidrógeno', 'Helio', 'Hierro', 'Helmio'],
      imageQuery: 'alchemist',
    },
  ];
  constructor(private preguntadosService: PreguntadosService) {}

  ngOnInit() {
    this.loadNewQuestion(); // Cargar la primera pregunta
  }

  // Cargar una nueva pregunta
  loadNewQuestion() {
    this.answered = false;
    this.selectedOption = null;

    if (this.currentQuestionIndex < this.questions.length) {
      const triviaData = this.questions[this.currentQuestionIndex];
      this.question = triviaData.question;
      this.correctAnswer = triviaData.correctAnswer;
      this.options = this.shuffleOptions(triviaData.options);

      const query = triviaData.imageQuery;

      this.preguntadosService.getImages(query, 1).subscribe({
        next: (imageResponse) => {
          if (imageResponse.photos && imageResponse.photos.length > 0) {
            this.imageUrl = imageResponse.photos[0].src.medium;
          } else {
            console.error('No images found for the query.');
          }
        },
        error: (error) => {
          console.error('Error fetching images:', error);
        },
      });

      this.loading = false;
      this.startTimer(); // Iniciar temporizador al cargar una nueva pregunta
    } else {
      this.showFinalScore();
    }
  }

  // Mostrar el puntaje final y un botón para reiniciar el juego
  showFinalScore() {
    this.loading = false;
  }

  // Función para mezclar las opciones de respuesta
  shuffleOptions(options: string[]): string[] {
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  }

  // Verificar la respuesta seleccionada por el usuario
  checkAnswer(option: string) {
    if (!this.answered) {
      this.answered = true;
      this.selectedOption = option;

      clearTimeout(this.timer);

      if (option === this.correctAnswer) {
        this.score++;
      }

      setTimeout(() => {
        this.nextQuestion();
      }, 1500);
    }
  }

  nextQuestion() {
    this.currentQuestionIndex++;

    if (this.currentQuestionIndex < this.questions.length) {
      this.loadNewQuestion();
    } else {
      this.showFinalScore();
    }
  }

  // Iniciar el temporizador para la pregunta actual
  startTimer() {
    this.timeLeft = 10;
    this.progress = 100;
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.progress = (this.timeLeft / 10) * 100;

      if (this.timeLeft === 0) {
        clearInterval(this.timer);
        this.checkAnswer('');
      }
    }, 1000);
  }

  // Función para reiniciar el juego
  restartGame() {
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.loadNewQuestion();
  }

  // Función para cambiar el estilo según la respuesta seleccionada
  getButtonStyle(option: string) {
    if (this.answered) {
      if (option === this.correctAnswer) {
        return 'bg-green-500 text-white';
      } else if (option === this.selectedOption) {
        return 'bg-red-500 text-white';
      }
    }
    return 'bg-purple-500 text-white hover:bg-purple-600';
  }
}
