import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Pelicula as PeliculaComponent } from '../pelicula/pelicula';

export interface Pelicula {
  id: number;
  titulo: string;
  generos: string[]; 
  duracion: string;
  imagen: string;
  sinopsis: string;
  promedioEstrellas: number; 
  esMasVendida?: boolean; 
  enPreventa?: boolean; 
  precioPreventa?: number;
}

@Component({
  selector: 'app-cartelera',
  standalone: true,
  imports: [CommonModule, FormsModule, PeliculaComponent, RouterLink],
  templateUrl: './cartelera.html',
  styleUrl: './cartelera.css'
})
export class Cartelera {
  valor: string = 'mi-dato';

  cambiarValor() {
    this.valor = 'Nuevo valor (' + Math.floor(Math.random() * 100) + ')';
  }

  busqueda: string = '';
  generoSeleccionado: string = 'Todos';
  generosDisponibles: string[] = ['Todos', 'Acción', 'Aventura', 'Drama', 'Ciencia Ficción', 'Terror'];

  peliculas: Pelicula[] = [
    {
      id: 1,
      titulo: 'Spider-man: Un nuevo día',
      generos: ['Acción', 'Drama'],
      duracion: '175 min',
      imagen: 'assets/spider-man.jpg',
      sinopsis: 'Tras el éxito mundial sin precedentes de Spider-Man: Sin regreso a casa, Spider-Man: Un nuevo día marca un capítulo completamente nuevo para Peter Parker...',
      promedioEstrellas: 4.8,
      esMasVendida: true
    },
    {
      id: 2,
      titulo: 'La odisea',
      generos: ['Acción', 'Drama'],
      duracion: '148 min',
      imagen: 'assets/la-odisea.jpg',
      sinopsis: 'Una epopeya mitológica que sigue la historia de Odiseo y su largo viaje a casa, de 10 años de duración, tras la guerra de Troya.',
      promedioEstrellas: 4.5,
      esMasVendida: true
    },
    {
      id: 3,
      titulo: 'Rapidos y Furiosos: 25 aniversario',
      generos: ['Ciencia Ficción', 'Acción', 'Aventura'],
      duracion: '169 min',
      imagen: 'assets/rapidos-furiosos.jpeg',
      sinopsis: 'Una misteriosa banda de delincuentes se dedica a robar camiones en marcha desde vehículos deportivos...',
      promedioEstrellas: 4.9,
      esMasVendida: true
    },
    {
      id: 4,
      titulo: 'La invitación',
      generos: ['Terror', 'Drama'],
      duracion: '190 min',
      imagen: 'assets/la-invitacion.jpg',
      sinopsis: 'Joe y Angela están en una situación de pareja muy delicada y esta noche podría ser cuando todo se termine de derrumbar...',
      promedioEstrellas: 4.2,
      enPreventa: true,
      precioPreventa: 4500
    }
  ];

  peliculaSeleccionada: Pelicula | null = null;

  verDetalle(pelicula: Pelicula) {
    this.peliculaSeleccionada = pelicula;
  }

  cerrarDetalle() {
    this.peliculaSeleccionada = null;
  }

  get masVendidas(): Pelicula[] {
    return this.peliculas.filter(p => p.esMasVendida).slice(0, 3);
  }


  get peliculasFiltradas(): Pelicula[] {
    return this.peliculas.filter(p => {
      const coincideTitulo = p.titulo.toLowerCase().includes(this.busqueda.toLowerCase());
      const coincideGenero = this.generoSeleccionado === 'Todos' || p.generos.includes(this.generoSeleccionado);
      return coincideTitulo && coincideGenero;
    });
  }
}