import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PeliculaServicio } from '../../../services/peliculaServicio';
import { PeliculaData } from '../../../models/peliculaData';
import { ActivatedRoute } from '@angular/router';

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
    sala: 'Sala 1',
    esMayor18: false
  };

  editandoId: number | null = null;
  mensajeRespuesta: { exito: boolean; texto: string } | null = null;
  cargando: boolean = false;

  constructor(
    private peliculaServicio: PeliculaServicio,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.cargarPeliculas();

    this.route.queryParams.subscribe(params => {
      const titulo = params['titulo'];
      const descripcion = params['descripcion'];

      if (titulo && descripcion) {
        this.editandoId = null;
        this.limpiarFormularioPelicula();

        this.nuevaPelicula.titulo = titulo;
        this.nuevaPelicula.sinopsis = descripcion;

        this.cdr.detectChanges();

        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    });
  }

  async cargarPeliculas(): Promise<void> {
    this.cargando = true;
    this.peliculas = await this.peliculaServicio.getPeliculas();
    this.cargando = false;
    this.cdr.detectChanges();
  }

  seleccionarParaEditar(pelicula: PeliculaData): void {
    if (!pelicula.id) return;

    this.editandoId = pelicula.id;
    this.nuevaPelicula = {
      titulo: pelicula.titulo,
      sinopsis: pelicula.sinopsis || '',
      duracionMinutos: pelicula.duracionMinutos,
      imagenUrl: pelicula.imagenUrl || '',
      generos: pelicula.generos || '',
      EsteProximamente: pelicula.EsteProximamente || false,
      fechaEstreno: pelicula.fechaEstreno || '',
      enPreventa: pelicula.enPreventa || false,
      precio: pelicula.precio,
      precioPreventa: pelicula.precioPreventa || 0,
      sala: pelicula.sala,
      esMayor18: pelicula.esMayor18 || false
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.limpiarFormularioPelicula();
  }

  async guardarPelicula(): Promise<void> {
    this.mensajeRespuesta = null;

    if (!this.nuevaPelicula.titulo || !this.nuevaPelicula.duracionMinutos) {
      this.mensajeRespuesta = {
        exito: false,
        texto: 'El título y la duración son obligatorios.'
      };
      return;
    }
    this.cargando = true;
    try {
      let resultado: boolean = false;

      if (this.editandoId) {
        const peliculaActualizada: PeliculaData = {
          id: this.editandoId,
          ...this.nuevaPelicula
        };
        resultado = await this.peliculaServicio.actualizarPelicula(
          peliculaActualizada
        );
      } else {
        const creada = await this.peliculaServicio.crearPelicula(
          this.nuevaPelicula
        );
        resultado = Boolean(creada);
      }

      if (resultado) {
        this.mensajeRespuesta = {
          exito: true,
          texto: this.editandoId
            ? 'Película actualizada exitosamente.'
            : 'Película agregada exitosamente a la cartelera.'
        };
        this.cancelarEdicion();
        await this.cargarPeliculas();
      } else {
        this.mensajeRespuesta = {
          exito: false,
          texto: 'No se pudo guardar los cambios en Supabase. Revisa la consola.'
        };
      }
    } catch (error) {
      console.error('Error no controlado al guardar:', error);
      this.mensajeRespuesta = {
        exito: false,
        texto: 'Ocurrió un error inesperado al conectar con el servidor.'
      };
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
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