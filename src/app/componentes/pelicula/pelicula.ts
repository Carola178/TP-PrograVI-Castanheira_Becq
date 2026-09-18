import { Component, input, effect } from '@angular/core';

@Component({
  selector: 'app-pelicula',
  standalone: true,
  imports: [],
  templateUrl: './pelicula.html',
  styleUrl: './pelicula.css'
})
export class Pelicula {
  id = input<string>();

  constructor() {
    effect(() => {
      console.log('¡Signal detectó el clic en la película! ID recibido:', this.id());
    });
  }
}