import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompraServicio, ConfiguracionDescuento } from '../../../services/compraServicio';

@Component({
  selector: 'app-admin-descuentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-descuentos.html',
  styleUrls: ['./admin-descuentos.css']
})
export class AdminDescuentos implements OnInit {
  descuentoPrimeraCompra: number = 20; // RF 4: 20%
  descuentoMayorEdad: number = 0;

  cargando: boolean = false;
  guardandoPrimera: boolean = false;
  guardandoMayorEdad: boolean = false;

  mensajeError: string = '';
  mensajeExito: string = '';

  constructor(
    private compraServicio: CompraServicio,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDescuentos();
  }

  async cargarDescuentos() {
    this.cargando = true;
    this.limpiarMensajes();

    try {
      const configs: ConfiguracionDescuento[] = await this.compraServicio.obtenerConfiguracionesDescuentos();
      
      const itemPrimera = configs.find(c => c.clave === 'descuento_primera_compra');
      if (itemPrimera) {
        this.descuentoPrimeraCompra = itemPrimera.valor;
      }

      const itemMayorEdad = configs.find(c => c.clave === 'descuento_mayor_edad');
      if (itemMayorEdad) {
        this.descuentoMayorEdad = itemMayorEdad.valor;
      }
    } catch (error) {
      console.error('Error al cargar descuentos:', error);
      this.mensajeError = 'Error al obtener las configuraciones.';
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  async guardarDescuentoPrimeraCompra() {
    this.limpiarMensajes();

    if (this.descuentoPrimeraCompra < 0 || this.descuentoPrimeraCompra > 100) {
      this.mensajeError = 'El porcentaje debe estar entre 0 y 100.';
      return;
    }

    this.guardandoPrimera = true;
    const exito = await this.compraServicio.guardarPorcentajeDescuento(
      'descuento_primera_compra',
      this.descuentoPrimeraCompra
    );
    this.guardandoPrimera = false;

    if (exito) {
      this.mensajeExito = 'Porcentaje de primera compra guardado con éxito.';
    } else {
      this.mensajeError = 'Error al actualizar el descuento.';
    }
    this.cdr.detectChanges();
  }

  async guardarDescuentoMayorEdad() {
    this.limpiarMensajes();

    if (this.descuentoMayorEdad < 0 || this.descuentoMayorEdad > 100) {
      this.mensajeError = 'El porcentaje debe estar entre 0 y 100.';
      return;
    }

    this.guardandoMayorEdad = true;
    const exito = await this.compraServicio.guardarPorcentajeDescuento(
      'descuento_mayor_edad',
      this.descuentoMayorEdad
    );
    this.guardandoMayorEdad = false;

    if (exito) {
      this.mensajeExito = 'Porcentaje para mayores de edad guardado con éxito.';
    } else {
      this.mensajeError = 'Error al actualizar el descuento.';
    }
    this.cdr.detectChanges();
  }

  limpiarMensajes() {
    this.mensajeError = '';
    this.mensajeExito = '';
  }
}