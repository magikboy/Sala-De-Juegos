import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChatRoomComponent } from './chat-room/chat-room.component';

@NgModule({
  declarations: [ChatRoomComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      { path: '', component: ChatRoomComponent }
    ])
  ]
})
export class ChatModule { }
