import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TetrisComponent } from './tetris.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [TetrisComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: TetrisComponent }]),
  ],
})
export class TetrisModule {}
