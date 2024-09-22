import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../auth.service';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../../services/firebase.config';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css'],
})
export class ChatRoomComponent implements OnInit, OnDestroy {
  messages: any[] = [];
  newMessage: string = '';
  chatDocId = 'chatRoom';
  private chatSubscription: Subscription | undefined;

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    await this.setupRealtimeListener();
  }

  ngOnDestroy() {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }
  }

  // Configurar el listener en tiempo real
  async setupRealtimeListener() {
    const chatDocRef = doc(db, 'chatMessages', this.chatDocId);

    // Crear el documento si no existe
    const chatDocSnap = await getDoc(chatDocRef);
    if (!chatDocSnap.exists()) {
      await setDoc(chatDocRef, { messages: [] });
    }

    // Configurar el listener en tiempo real
    this.chatSubscription = new Subscription();
    const unsubscribe = onSnapshot(chatDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        this.messages = docSnapshot.data()['messages'] || [];
      }
    });

    this.chatSubscription.add(() => unsubscribe());
  }

  async sendMessage() {
    if (this.newMessage.trim()) {
      const user = this.authService.getCurrentUser();
      const message = {
        user: user && user.email ? user.email.split('@')[0] : 'Anónimo',
        text: this.newMessage,
        timestamp: new Date().toISOString(),
      };

      try {
        const chatDocRef = doc(db, 'chatMessages', this.chatDocId);
        await updateDoc(chatDocRef, {
          messages: arrayUnion(message),
        });
        this.newMessage = ''; // Limpia el input después de enviar
      } catch (error) {
        console.error('Error al guardar el mensaje en Firestore:', error);
      }
    }
  }

  isCurrentUser(userEmail: string): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser && currentUser.email
      ? userEmail === currentUser.email.split('@')[0]
      : false;
  }
}
