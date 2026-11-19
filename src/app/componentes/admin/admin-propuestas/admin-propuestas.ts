import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropuestasServicio } from '../../../services/propuestaServicio';
import { PropuestaPeliculaData } from '../../../models/propuestaPeliculaData';
import { Router } from '@angular/router';

type FiltroPropuestas = | 'todas' | 'pendiente' | 'aceptada' | 'rechazada';

@Component({
  selector: 'app-admin-propuestas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-propuestas.html',
  styleUrl: './admin-propuestas.css'
})
export class AdminPropuestas implements OnInit {

  propuestas: PropuestaPeliculaData[] = [];
  cargando = true;
  procesandoId: string | null = null;
  filtroActual: FiltroPropuestas = 'pendiente';
  mensajeError = '';
  mensajeExito = '';

  constructor(
    private propuestasServicio: PropuestasServicio,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.cargarPropuestas();
  }

  async cargarPropuestas(): Promise<void> {
    this.cargando = true;
    this.mensajeError = '';

    try {
      this.propuestas =
        await this.propuestasServicio.obtenerTodasLasPropuestas();

    } catch (error) {
      this.mensajeError = error instanceof Error
        ? error.message
        : 'No se pudieron cargar las propuestas.';

    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  cambiarFiltro(filtro: FiltroPropuestas): void {
    this.filtroActual = filtro;
  }

  get propuestasFiltradas(): PropuestaPeliculaData[] {
    if (this.filtroActual === 'todas') {
      return this.propuestas;
    }

    return this.propuestas.filter(
      propuesta => propuesta.estado === this.filtroActual
    );
  }

  get cantidadPendientes(): number {
    return this.propuestas.filter(
      propuesta => propuesta.estado === 'pendiente'
    ).length;
  }

  async cambiarEstado(
    propuesta: PropuestaPeliculaData,
    estado: 'aceptada' | 'rechazada'
  ): Promise<void> {

    if (this.procesandoId !== null) return;

    this.procesandoId = propuesta.id;
    this.mensajeError = '';
    this.mensajeExito = '';
    this.cdr.detectChanges();

    try {
      await this.propuestasServicio.cambiarEstado(
        propuesta.id,
        estado
      );
      this.propuestas = this.propuestas.map(p =>
        p.id === propuesta.id
          ? { ...p, estado }
          : p
      );

      if (estado === 'aceptada') {
        await this.router.navigate(
          ['/admin/funciones'],
          {
            queryParams: {
              titulo: propuesta.titulo,
              descripcion: propuesta.descripcion
            }
          }
        );

      } else {

        this.mensajeExito =
          `La propuesta "${propuesta.titulo}" fue rechazada correctamente.`;
      }
    } catch (error) {
      console.error('Error al actualizar propuesta:', error);
      this.mensajeError = error instanceof Error
        ? error.message
        : 'No se pudo actualizar la propuesta.';
    } finally {
      this.procesandoId = null;
      this.cdr.detectChanges();
    }
  }
}
