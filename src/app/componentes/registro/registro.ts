import { Component, OnInit } from '@angular/core';
import { Auth } from '../../services/auth';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { validarFechaNacimiento } from '../../componentes/validators/fechaNacimiento';
import { RouterLink } from '@angular/router';
import { ModalBienvenida } from '../modal-bienvenida/modal-bienvenida';

@Component({
  imports: [ReactiveFormsModule, CommonModule, RouterLink, ModalBienvenida],
  selector: 'app-registro',
  styleUrl: './registro.css',
  templateUrl: './registro.html',
})
export class Registro implements OnInit{
  mostrarModalBienvenida = false;
  mostrarPassword = false;

  alternarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  campoInvalido(campo: string): boolean {
    const control = this.registroModel.get(campo);

    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty)
    );
  }

  obtenerError(campo: string): string {
      const control = this.registroModel.get(campo);

      if (!control || !control.errors) return '';

      if (control.hasError('required')) {
          return 'Este campo es obligatorio.';
      }

      if (control.hasError('minlength')) {
          const minimo = control.errors['minlength'].requiredLength;
          return `Debe tener al menos ${minimo} caracteres.`;
      }

      if (control.hasError('maxlength')) {
          const maximo = control.errors['maxlength'].requiredLength;
          return `No puede superar los ${maximo} caracteres.`;
      }

      if (control.hasError('email')) {
          return 'Ingresá un correo electrónico válido. Ej: usuario@gmail.com';
      }

      if (control.hasError('fechaInvalida')) {
          return 'Ingresá una fecha válida en formato DD/MM/AAAA.';
      }

      if (control.hasError('fechaFutura')) {
          return 'La fecha de nacimiento no puede ser futura.';
      }

      if (control.hasError('min')) {
          return 'El valor no puede ser negativo.';
      }

      if (control.hasError('max')) {
          return 'El valor no puede superar 365.';
      }

      if (control.hasError('pattern')) {
          switch (campo) {
              case 'nombre':
              case 'apellido':
                  return 'Solo se permiten letras y espacios, sin números ni símbolos.';

              case 'diasVacaciones':
                  return 'Ingresá un número entero.';

              case 'email':
                  return 'Ingresá un correo electrónico válido.';

              default:
                  return 'El formato ingresado no es válido.';
          }
      }

      return 'Revisá el valor ingresado.';
  }

  formatearFecha(event: Event): void {
    const input = event.target as HTMLInputElement;
    let numeros = input.value.replace(/\D/g, '').slice(0, 8);
    if (numeros.length > 4) {
      numeros =
        numeros.slice(0, 2) + '/' +
        numeros.slice(2, 4) + '/' +
        numeros.slice(4);
    } else if (numeros.length > 2) {
      numeros = numeros.slice(0, 2) + '/' + numeros.slice(2);
    }
    this.registroModel.controls.fechaNacimiento.setValue(numeros);
  }

    registroModel = new FormGroup({
    nombre: new FormControl('', {
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ ]+$')]
    }),
    apellido: new FormControl('', {
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ ]+$')]
    }),
    email: new FormControl('', {
        validators: [Validators.required, Validators.email, Validators.maxLength(100)]
    }),
    fechaNacimiento: new FormControl('', {
      validators: [Validators.required, validarFechaNacimiento()]
    }),
    tipoSangre: new FormControl("", {
      validators: [Validators.required, Validators.pattern('^(A|B|AB|O|0)[+-]$')]
    }),
    colorOjos: new FormControl("", {
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(15), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ /]+$')]
    }),
    diasVacaciones : new FormControl ("", {
      validators: [Validators.required, Validators.min(0), Validators.max(365), Validators.pattern('^[0-9]+$')]
    }),
    password: new FormControl("", {
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(12),]
    })

  })
  ngOnInit(): void {}

  constructor(private auth: Auth, private router: Router) {
    this.formatearNombre('nombre');
    this.formatearNombre('apellido');
  }

  async onSubmit(event: Event){
    event.preventDefault();

    const credenciales = this.registroModel.value;

    const resultado = await this.auth.signUp(credenciales.nombre!, credenciales.apellido!, credenciales.email!, credenciales.fechaNacimiento!, credenciales.tipoSangre!, credenciales.colorOjos!, Number(credenciales.diasVacaciones!), credenciales.password!);

    if (resultado.data?.user) {
      const { error: dbError } = await this.auth.supabase
        .from('Usuarios')
        .insert({
          auth_id: resultado.data.user.id,
          nombre: credenciales.nombre,
          apellido: credenciales.apellido,
          email: credenciales.email,
          fechaNacimiento: credenciales.fechaNacimiento,
          tipoSangre: credenciales.tipoSangre,
          colorOjos: credenciales.colorOjos,
          diasVacaciones: credenciales.diasVacaciones
        });

    if(resultado.error){
      console.log('Login falló, resultado.error');
      return;
    }
    this.mostrarModalBienvenida = true;
    setTimeout(() => {
        this.router.navigate(['/cartelera']);
    }, 2000);
        }
  }

  formatearNombre(campo: 'nombre' | 'apellido'): void {
    const control = this.registroModel.get(campo);

    if (!control || !control.value) return;

    const texto = control.value;

    const textoFormateado = texto.replace(
      /(^|\s)([a-záéíóúñ])/gi,
      (_coincidencia, espacio, letra) =>
        espacio + letra.toLocaleUpperCase('es-AR')
    );

    if (texto !== textoFormateado) {
      control.setValue(textoFormateado, { emitEvent: false });
    }
  }
}
