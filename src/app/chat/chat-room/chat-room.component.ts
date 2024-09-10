import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../../services/firebase.config';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css'],
})
export class ChatRoomComponent implements OnInit {
  messages: any[] = [];
  newMessage: string = '';
  chatDocId = 'chatRoom';

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    await this.loadMessages();
  }

  // Cargar los mensajes del documento en Firestore
  async loadMessages() {
    const chatDocRef = doc(db, 'chatMessages', this.chatDocId);
    const chatDocSnap = await getDoc(chatDocRef);

    if (chatDocSnap.exists()) {
      this.messages = chatDocSnap.data()['messages'] || [];
    } else {
      // Si el documento no existe, crearlo con un array vacío
      console.log('El documento no existe, creando uno nuevo...');
      await setDoc(chatDocRef, { messages: [] });
      this.messages = [];
    }
  }

  async sendMessage() {
    if (this.newMessage.trim()) {
      const user = this.authService.getCurrentUser();
      const message = {
        user: user && user.email ? user.email.split('@')[0] : 'Anónimo',
        text: this.newMessage,
        timestamp: new Date().toLocaleString(),
      };

      try {
        // Ref al documento único
        const chatDocRef = doc(db, 'chatMessages', this.chatDocId);

        await updateDoc(chatDocRef, {
          messages: arrayUnion(message),
        });

        // Actualiza la lista local de mensajes
        this.messages.push(message);
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
