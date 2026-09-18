import { Component, OnInit, signal } from '@angular/core';
import { form, required, email, FormField } from '@angular/forms/signals';
import { Auth } from '../../services/auth';
import { LoginData } from '../../models/loginData';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ɵInternalFormsSharedModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordsIncorrectas } from '../validators/usuario.validators';



@Component({
  imports: [FormField, RouterLink, ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})


//formularios que funcionan con los fomrularios, las validaciones se hacen ahi mismo
export class Login implements OnInit{
  loginModel = new FormGroup({
      //controles para los campos//
    email: new FormControl ("", {
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(25), Validators.email]
    }),
    password: new FormControl("", {
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(12), passwordsIncorrectas()]
    })

  })
  ngOnInit(): void {
    this.loginModel.valueChanges.subscribe(estado => console.log(estado)) //observables, se actualiza todo el estado

  }
  mostrar(){
    // console.log(this.loginModel.value)
    const email = this.loginModel.controls.email;
    console.log(this.loginModel.valid);

  }


  constructor(private auth: Auth, private router: Router) {}

  async onSubmit(event: Event){
    event.preventDefault();

    const credenciales = this.loginModel.value;

    const resultado = await this.auth.signIn(credenciales.email!, credenciales.password!);
    if(resultado.error){
      console.log('Login falló, resultado.error');
      return;
    }
    console.log('Login exitoso: ', resultado.data);
    this.router.navigate(['/cartelera']);
  }

}
