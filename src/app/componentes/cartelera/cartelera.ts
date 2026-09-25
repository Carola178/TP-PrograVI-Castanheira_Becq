import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PeliculaData } from '../../models/peliculaData';
import { PeliculaServicio } from '../../services/peliculaServicio';

@Component({
  selector: 'app-cartelera',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cartelera.html',
  styleUrl: './cartelera.css'
})
export class Cartelera implements OnInit {
  busqueda: string = '';
  generoSeleccionado: string = 'Todos';
  generosDisponibles: string[] = ['Todos', 'Acción', 'Aventura', 'Drama', 'Ciencia Ficción', 'Terror'];

  peliculas: PeliculaData[] = [];

  constructor(
    private peliculaServicio: PeliculaServicio,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.cargarCartelera();
  }

  cargarCartelera(): void {
    this.peliculaServicio.getPeliculas()
      .then((datos: PeliculaData[]) => {
        console.log('Películas cargadas:', datos);
        this.peliculas = datos;
        this.cdr.detectChanges(); 
      })
      .catch((err: unknown) => {
        console.error('Error al traer películas de la BDD:', err);
      });
  }

  get masVendidas(): PeliculaData[] {
    return this.peliculas ? this.peliculas.slice(0, 3) : [];
  }

  get peliculasFiltradas(): PeliculaData[] {
    if (!this.peliculas) return [];

    return this.peliculas.filter(p => {
      const coincideTitulo = p.titulo 
        ? p.titulo.toLowerCase().includes(this.busqueda.toLowerCase()) 
        : true;

      let coincideGenero = true;
      if (this.generoSeleccionado !== 'Todos') {
        const generosTexto = String(p.generos || '');
        coincideGenero = generosTexto.toLowerCase().includes(this.generoSeleccionado.toLowerCase());
      }

      return coincideTitulo && coincideGenero;
    });
  }
}