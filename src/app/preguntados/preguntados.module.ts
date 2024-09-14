import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreguntadosComponent } from './preguntados.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [PreguntadosComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule.forChild([{ path: '', component: PreguntadosComponent }]),
  ],
})
export class PreguntadosModule {}
