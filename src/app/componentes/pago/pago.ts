import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CompraServicio } from '../../services/compraServicio';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pago.html',
  styleUrl: './pago.css'
})
export class Pago implements OnInit {
  resumen: any = null;
  subtotalEntradas = 0;
  subtotalCandy = 0;
  montoDescuento = 0;
  creditoAplicado = 0;
  totalPagar = 0;

  precioEntradaBase = 5000;
  precioEntradaVip = 7500;

  constructor(
    private compraServicio: CompraServicio,
    private router: Router
  ) {}

  ngOnInit() {
    this.resumen = this.compraServicio.getResumenCompra();

    if (!this.resumen.pelicula && this.compraServicio.peliculaSeleccionada) {
      this.resumen.pelicula = this.compraServicio.peliculaSeleccionada;
    }

    this.calcularTotales();
  }

  esVip(asiento: any): boolean {
    const fila = asiento?.fila?.toUpperCase();
    return asiento?.esVip || ['R', 'S', 'T'].includes(fila);
  }

  calcularTotales() {
    this.subtotalEntradas = (this.resumen?.asientos || []).reduce((acc: number, b: any) => {
      return acc + (this.esVip(b) ? this.precioEntradaVip : this.precioEntradaBase);
    }, 0);

    this.subtotalCandy = (this.resumen?.candy || []).reduce((acc: number, p: any) => {
      return acc + (p.precio * (p.cantidad || 1));
    }, 0);

    const subtotalBruto = this.subtotalEntradas + this.subtotalCandy;

    if (this.resumen?.usuario?.esPrimeraCompra) {
      this.montoDescuento = subtotalBruto * 0.20;
    } else {
      this.montoDescuento = 0;
    }

    const totalConDescuento = subtotalBruto - this.montoDescuento;

    if (this.resumen?.usuario?.creditoDisponible > 0) {
      this.creditoAplicado = Math.min(this.resumen.usuario.creditoDisponible, totalConDescuento);
    } else {
      this.creditoAplicado = 0;
    }

    this.totalPagar = Math.max(0, totalConDescuento - this.creditoAplicado);
  }

  volverAlCandy() {
    this.router.navigate(['/candy']);
  }

  procesarPago() {
    alert('¡Pago procesado con éxito!');
    this.compraServicio.limpiar();
    this.router.navigate(['/cartelera']);
  }
}