import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuienSoyComponent } from './quien-soy.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [QuienSoyComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: QuienSoyComponent }]),
  ],
})
export class QuienSoyModule {}
