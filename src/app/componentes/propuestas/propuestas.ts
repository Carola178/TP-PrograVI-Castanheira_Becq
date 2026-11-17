import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PropuestasServicio } from '../../services/propuestaServicio';
import { PropuestaPeliculaData } from '../../models/propuestaPeliculaData';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-propuestas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './propuestas.html',
  styleUrl: './propuestas.css'
})
export class Propuestas implements OnInit {

  titulo = '';
  descripcion = '';
  justificacion = '';

  cargando = true;
  enviando = false;

  mensajeError = '';
  mensajeExito = '';

  propuestaPendiente: PropuestaPeliculaData | null = null;
  usuarioAutenticado = false;

  constructor(
    private propuestasServicio: PropuestasServicio,
    private auth: Auth,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    await this.cargarEstado();
  }

  async cargarEstado(): Promise<void> {
    this.cargando = true;
    this.mensajeError = '';

    try {
      const usuario = await this.auth.getUsuarioActual();

      this.usuarioAutenticado = !!usuario;

      if (usuario) {
        const propuestas =
          await this.propuestasServicio.obtenerMisPropuestas();

        this.propuestaPendiente = propuestas.find(
          p => p.estado === 'pendiente'
        ) ?? null;
      }

    } catch (error) {
      this.mensajeError = error instanceof Error
        ? error.message
        : 'No se pudieron cargar las propuestas.';
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  async enviarPropuesta(): Promise<void> {
    if (this.enviando || this.propuestaPendiente) return;

    this.mensajeError = '';
    this.mensajeExito = '';

    if (
      !this.titulo.trim() ||
      !this.descripcion.trim() ||
      !this.justificacion.trim()
    ) {
      this.mensajeError = 'Completá todos los campos.';
      return;
    }

    this.enviando = true;

    try {
      await this.propuestasServicio.crearPropuesta(
        this.titulo,
        this.descripcion,
        this.justificacion
      );

      this.mensajeExito =
        '¡Tu propuesta fue enviada correctamente!';

      this.titulo = '';
      this.descripcion = '';
      this.justificacion = '';

      await this.cargarEstado();

    } catch (error) {
      this.mensajeError = error instanceof Error
        ? error.message
        : 'Ocurrió un error al enviar la propuesta.';
    } finally {
      this.enviando = false;
      this.cdr.detectChanges();
    }
  }
}
