import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { AuthService } from '../auth.service';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase.config';

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './encuesta.component.html',
  styleUrls: ['./encuesta.component.scss'],
})
export class EncuestaComponent implements OnInit {
  encuestaForm!: FormGroup;
  submitted = false;
  encuestaGuardada = false;
  currentStep = 1;

  colores = ['Rojo', 'Azul', 'Verde', 'Amarillo', 'Negro', 'Blanco'];
  estaciones = ['Primavera', 'Verano', 'Otoño', 'Invierno'];
  generosMusicales = ['Rock', 'Pop', 'Clásica', 'Jazz', 'Electrónica'];

  // Especificamos el tipo de stepFields para corregir el error
  stepFields: { [key: number]: string[] } = {
    1: ['nombreApellido', 'edad', 'telefono'],
    2: ['pregunta1', 'pregunta2', 'pregunta3'],
  };

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.encuestaForm = this.fb.group({
      nombreApellido: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(18), Validators.max(99)]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      pregunta1: ['', Validators.required],
      pregunta2: ['', Validators.required],
      pregunta3: this.fb.array([], Validators.required),
    });
  }

  nextStep() {
    this.submitted = true;
    if (this.currentStep === 1) {
      const stepValid = this.validateCurrentStep();
      if (stepValid) {
        this.currentStep++;
        this.submitted = false;
      }
    }
  }

  async onSubmit() {
    this.submitted = true;
    if (this.currentStep === 2) {
      const stepValid = this.validateCurrentStep();
      if (stepValid) {
        const user = this.authService.getCurrentUser();
        const usuario = user && user.email ? user.email : 'Anónimo';
        const fecha = new Date().toLocaleString();
        const respuestas = this.encuestaForm.value;

        try {
          const encuestasRef = collection(db, 'Encuestas');
          await addDoc(encuestasRef, {
            ...respuestas,
            usuario,
            fecha,
          });
          console.log('Encuesta guardada con éxito');
          this.encuestaGuardada = true;
          this.encuestaForm.reset();
          this.submitted = false;
          this.currentStep = 1;
        } catch (error) {
          console.error('Error al guardar la encuesta:', error);
        }
      }
    }
  }

  validateCurrentStep(): boolean {
    const fields = this.stepFields[this.currentStep];
    let stepValid = true;

    fields.forEach((fieldName: string) => {
      const control = this.encuestaForm.get(fieldName);
      if (control && control.invalid) {
        stepValid = false;
        control.markAsTouched();
      }
    });

    return stepValid;
  }

  onCheckboxChange(e: any) {
    const pregunta3: FormArray = this.encuestaForm.get(
      'pregunta3'
    ) as FormArray;
    if (e.target.checked) {
      pregunta3.push(this.fb.control(e.target.value));
    } else {
      const index = pregunta3.controls.findIndex(
        (item) => item.value === e.target.value
      );
      if (index !== -1) {
        pregunta3.removeAt(index);
      }
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.submitted = false;
    }
  }

  get f() {
    return this.encuestaForm.controls;
  }
}
