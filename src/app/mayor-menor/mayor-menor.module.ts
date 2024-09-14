import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MayorMenorComponent } from './mayor-menor.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [MayorMenorComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: MayorMenorComponent }]),
  ],
})
export class MayorMenorModule {}
