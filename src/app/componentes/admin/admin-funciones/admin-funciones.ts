import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PeliculaServicio } from '../../../services/peliculaServicio';
import { PeliculaData } from '../../../models/peliculaData';

@Component({
  selector: 'app-admin-funciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-funciones.html',
  styleUrls: ['./admin-funciones.css']
})
export class AdminFunciones implements OnInit {
  peliculas: PeliculaData[] = [];

  nuevaPelicula: Omit<PeliculaData, 'id'> = {
    titulo: '',
    sinopsis: '',
    duracionMinutos: 120,
    imagenUrl: '',
    generos: '',
    EsteProximamente: false,
    fechaEstreno: '',
    enPreventa: false,
    precio: 35000,
    precioPreventa: 0,
    sala: 'sala 1',
    esMayor18: false
  };

  mensajeRespuesta: { exito: boolean; texto: string } | null = null;
  cargando: boolean = false;

  constructor(private peliculaServicio: PeliculaServicio) {}

  ngOnInit(): void {
    this.cargarPeliculas();
  }

  async cargarPeliculas(): Promise<void> {
    this.cargando = true;
    this.peliculas = await this.peliculaServicio.getPeliculas();
    this.cargando = false;
  }

  async guardarPelicula(): Promise<void> {
    this.mensajeRespuesta = null;

    if (!this.nuevaPelicula.titulo || !this.nuevaPelicula.duracionMinutos) {
      this.mensajeRespuesta = { exito: false, texto: 'El título y la duración son obligatorios.' };
      return;
    }

    const resultado = await this.peliculaServicio.crearPelicula(this.nuevaPelicula);

    if (resultado) {
      this.mensajeRespuesta = { exito: true, texto: 'Película agregada exitosamente a la cartelera.' };
      this.limpiarFormularioPelicula();
      await this.cargarPeliculas();
    } else {
      this.mensajeRespuesta = { exito: false, texto: 'Error al registrar la película en Supabase.' };
    }
  }

  limpiarFormularioPelicula(): void {
    this.nuevaPelicula = {
      titulo: '',
      sinopsis: '',
      duracionMinutos: 120,
      imagenUrl: '',
      generos: '',
      EsteProximamente: false,
      fechaEstreno: '',
      enPreventa: false,
      precio: 35000,
      precioPreventa: 0,
      sala: 'sala 1',
      esMayor18: false
    };
  }

  async borrarPelicula(id?: number): Promise<void> {
    if (!id) return;
    if (confirm('¿Estás seguro de eliminar esta película de la cartelera?')) {
      const ok = await this.peliculaServicio.eliminarPelicula(id);
      if (ok) {
        this.mensajeRespuesta = { exito: true, texto: 'Película eliminada correctamente.' };
        await this.cargarPeliculas();
      } else {
        this.mensajeRespuesta = { exito: false, texto: 'No se pudo eliminar la película.' };
      }
    }
  }
}