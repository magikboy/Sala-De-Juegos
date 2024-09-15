import { Component, OnInit } from '@angular/core';
import { PreguntadosService } from './services/preguntados.service';
import { AuthService } from '../auth.service'; // Importa el AuthService para obtener información del usuario
import { db } from '../../services/firebase.config'; // Importa la configuración de Firestore
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';

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
  puntajes: any[] = []; // Lista para almacenar puntajes desde Firestore

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
    {
      question: '¿Dónde se originaron los Juegos Olímpicos?',
      correctAnswer: 'Grecia',
      options: ['Roma', 'Grecia', 'Egipto', 'China'],
      imageQuery: 'ancient Olympia',
    },
    {
      question: '¿Cuál es la moneda oficial de Estados Unidos?',
      correctAnswer: 'Dólar estadounidense',
      options: ['Euro', 'Libra esterlina', 'Dólar canadiense', 'Dólar estadounidense'],
      imageQuery: 'US dollar bills',
    },
    {
      question: '¿Cuál es la pintura más famosa de Frida Kahlo?',
      correctAnswer: 'Las dos Fridas',
      options: ['La persistencia de la memoria', 'Las meninas', 'Guernica', 'Las dos Fridas'],
      imageQuery: 'Las dos Fridas painting',
    },
    {
      question: '¿Cuál es el edificio más alto del mundo?',
      correctAnswer: 'Burj Khalifa',
      options: ['One World Trade Center', 'Shanghai Tower', 'Burj Khalifa', 'Taipei 101'],
      imageQuery: 'Burj Khalifa',
    },
    {
      question: '¿Cuál es el idioma más hablado en el mundo?',
      correctAnswer: 'Mandarín',
      options: ['Español', 'Inglés', 'Hindi', 'Mandarín'],
      imageQuery: 'Mandarin language characters',
    },
    {
      question: '¿Qué país tiene la forma de una bota?',
      correctAnswer: 'Italia',
      options: ['Nueva Zelanda', 'Italia', 'India', 'Portugal'],
      imageQuery: 'Italy map',
    },
    {
      question: '¿Cuál es el océano más grande del mundo?',
      correctAnswer: 'Océano Pacífico',
      options: ['Océano Atlántico', 'Océano Índico', 'Océano Ártico', 'Océano Pacífico'],
      imageQuery: 'Pacific Ocean',
    },
    {
      question: '¿Quién es conocido como el Rey del Pop?',
      correctAnswer: 'Michael Jackson',
      options: ['Elvis Presley', 'Michael Jackson', 'Freddie Mercury', 'Prince'],
      imageQuery: 'Michael Jackson performing',
    },
    {
      question: '¿Qué país es el mayor productor de café en el mundo?',
      correctAnswer: 'Brasil',
      options: ['Colombia', 'Vietnam', 'Etiopía', 'Brasil'],
      imageQuery: 'Brazil coffee plantation',
    },
    {
      question: '¿Cuál es la especie de árbol más antigua del mundo?',
      correctAnswer: 'Pino Bristlecone',
      options: ['Roble', 'Pino Bristlecone', 'Secuoya', 'Baobab'],
      imageQuery: 'ancient Bristlecone pine',
    },
    {
      question: '¿Cuál es el libro más vendido en el mundo después de la Biblia?',
      correctAnswer: 'Don Quijote de la Mancha',
      options: ['El Señor de los Anillos', 'Don Quijote de la Mancha', 'El Alquimista', 'Cien años de soledad'],
      imageQuery: 'Don Quijote de la Mancha cover',
    },
    {
      question: '¿Cuál es la capital de Australia?',
      correctAnswer: 'Canberra',
      options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
      imageQuery: 'Canberra cityscape',
    },
    {
      question: '¿Qué científico formuló la teoría de la relatividad?',
      correctAnswer: 'Albert Einstein',
      options: ['Isaac Newton', 'Nikola Tesla', 'Albert Einstein', 'Stephen Hawking'],
      imageQuery: 'Albert Einstein',
    },
    {
      question: '¿Qué elemento químico tiene el símbolo Au?',
      correctAnswer: 'Oro',
      options: ['Oro', 'Plata', 'Aluminio', 'Azufre'],
      imageQuery: 'gold element',
    },
    {
      question: '¿En qué país se originó el sushi?',
      correctAnswer: 'Japón',
      options: ['China', 'Japón', 'Corea del Sur', 'Tailandia'],
      imageQuery: 'sushi traditional',
    },
    {
      question: '¿Cuál es el animal nacional de Australia?',
      correctAnswer: 'Canguro',
      options: ['Koala', 'Canguro', 'Emú', 'Tiburón blanco'],
      imageQuery: 'kangaroo in Australia',
    },
    {
      question: '¿Qué estructura famosa se encuentra en París?',
      correctAnswer: 'Torre Eiffel',
      options: ['Big Ben', 'Torre Eiffel', 'Coliseo', 'Estatua de la Libertad'],
      imageQuery: 'Eiffel Tower',
    },
    {
      question: '¿Cuál es el deporte más popular del mundo?',
      correctAnswer: 'Fútbol',
      options: ['Críquet', 'Baloncesto', 'Fútbol', 'Tenis'],
      imageQuery: 'football match',
    },
    {
      question: '¿Qué país es conocido como la tierra de los lagos y volcanes?',
      correctAnswer: 'Nicaragua',
      options: ['Finlandia', 'Nueva Zelanda', 'Nicaragua', 'Islandia'],
      imageQuery: 'Nicaragua lakes volcanoes',
    },
    {
      question: '¿Cuál es la única ciudad del mundo que está en dos continentes diferentes?',
      correctAnswer: 'Estambul',
      options: ['Moscú', 'El Cairo', 'Estambul', 'Lisboa'],
      imageQuery: 'Istanbul city',
    }
  ];

  constructor(
    private preguntadosService: PreguntadosService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadNewQuestion(); // Cargar la primera pregunta
    this.loadPuntajes(); // Cargar los puntajes al inicio
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

  // Verificar la respuesta seleccionada por el usuario
  checkAnswer(option: string) {
    if (!this.answered) {
      this.answered = true;
      this.selectedOption = option;

      clearTimeout(this.timer);

      if (option === this.correctAnswer) {
        this.score++;
        this.guardarPuntaje(); // Guardar el puntaje cuando la respuesta es correcta
      }

      setTimeout(() => {
        this.nextQuestion();
      }, 1500);
    }
  }

  // Pasar a la siguiente pregunta
  nextQuestion() {
    this.currentQuestionIndex++;

    if (this.currentQuestionIndex < this.questions.length) {
      this.loadNewQuestion();
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

  // Iniciar el temporizador para la pregunta actual
  startTimer() {
    this.timeLeft = 10;
    this.progress = 100;
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.progress = (this.timeLeft / 10) * 100;

      if (this.timeLeft === 0) {
        clearInterval(this.timer);
        this.checkAnswer(''); // Pasar a la siguiente pregunta si no se responde a tiempo
      }
    }, 1000);
  }

  // Función para reiniciar el juego
  restartGame() {
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.loadNewQuestion();
  }

  // Función para guardar el puntaje en Firestore
  async guardarPuntaje() {
    const user = this.authService.getCurrentUser();
    const usuario = user && user.email ? user.email.split('@')[0] : 'Anónimo';
    const nuevoPuntaje = this.score;
    const fecha = new Date().toLocaleString();

    const docRef = doc(db, 'PuntuacionPreguntado', 'puntajes');
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
    const docRef = doc(db, 'PuntuacionPreguntado', 'puntajes');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      this.puntajes = docSnap.data()['puntajes'] || [];
    }
  }

  // Función para cambiar el estilo según la respuesta seleccionada
  getButtonStyle(option: string): string {
    if (this.answered) {
      if (option === this.correctAnswer) {
        return 'bg-green-500 text-white'; // Estilo para respuesta correcta
      } else if (option === this.selectedOption) {
        return 'bg-red-500 text-white'; // Estilo para respuesta incorrecta
      }
    }
    return 'bg-purple-500 text-white hover:bg-purple-600'; // Estilo por defecto
  }
}
