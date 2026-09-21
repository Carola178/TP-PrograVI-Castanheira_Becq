import { Component, OnInit } from '@angular/core';
import { Auth } from '../../services/auth';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { validate } from '@angular/forms/signals';



@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-registro',
  styleUrl: './registro.css',
  templateUrl: './registro.html',
})
export class Registro implements OnInit{
    registroModel = new FormGroup({
      //controles para los campos//
    nombre: new FormControl ("", {
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]
    }),
    apellido: new FormControl("", {
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]
    }),
    email: new FormControl ("", {
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(25), Validators.email]
    }),
    fechaNacimiento: new FormControl("", {
      validators: [Validators.required, Validators.pattern('^\\d{4}-\\d{2}-\\d{2}$')]
    }),
    tipoSangre: new FormControl("", {
      validators: [Validators.required, Validators.pattern('^(A|B|AB|O|0)[+-]$')]
    }),
    colorOjos: new FormControl ("", {
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(15), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]
    }),
    diasVacaciones : new FormControl ("", {
      validators: [Validators.required, Validators.min(0), Validators.max(365), Validators.pattern('^[0-9]+$')]
    }),
    password: new FormControl("", {
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(12),]
    })

  })
  ngOnInit(): void {
    this.registroModel.valueChanges.subscribe(estado => console.log(estado)) //observables, se actualiza todo el estado

  }
  mostrar(){
    // console.log(this.loginModel.value)
    console.log(this.registroModel.valid);

  }


  constructor(private auth: Auth, private router: Router) {}

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
    console.log('Login exitoso: ', resultado.data);
    this.router.navigate(['/cartelera']);
    }
  }
}
