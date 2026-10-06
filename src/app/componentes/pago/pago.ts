import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CompraServicio } from '../../services/compraServicio';
import * as QRCode from 'qrcode';

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
  subtotalCompra = 0;
  montoDescuento = 0;
  porcentajeDescuento = 0;
  creditoAplicado = 0;
  totalPagar = 0;

  cargando = false;
  precioEntradaBase = 5000;
  precioEntradaVip = 7500;

  // Variables para el Modal del QR
  mostrarModalQR = false;
  codigoQRTexto = '';
  qrImageUrl = '';

  constructor(
    private compraServicio: CompraServicio,
    private router: Router
  ) {}

  async ngOnInit() {
    this.resumen = this.compraServicio.getResumenCompra?.() || {
      asientos: this.compraServicio.asientosSeleccionados,
      candy: this.compraServicio.productosCandy,
      usuario: this.compraServicio.usuarioInfo,
      pelicula: this.compraServicio.peliculaSeleccionada
    };

    if (!this.resumen.pelicula && this.compraServicio.peliculaSeleccionada) {
      this.resumen.pelicula = this.compraServicio.peliculaSeleccionada;
    }

    await this.calcularTotales();
  }

  esVip(asiento: any): boolean {
    const fila = asiento?.fila?.toUpperCase();
    return asiento?.esVip || ['R', 'S', 'T'].includes(fila);
  }

  async calcularTotales() {
    // 1. Subtotal de Entradas
    this.subtotalEntradas = (this.resumen?.asientos || []).reduce((acc: number, b: any) => {
      const precio = b.precio || (this.esVip(b) ? this.precioEntradaVip : this.precioEntradaBase);
      return acc + precio;
    }, 0);

    // 2. Subtotal de Candy
    this.subtotalCandy = (this.resumen?.candy || []).reduce((acc: number, p: any) => {
      return acc + (p.precio * (p.cantidad || 1));
    }, 0);

    // Subtotal de la compra
    this.subtotalCompra = this.subtotalEntradas + this.subtotalCandy;

    // 3. Porcentaje de Descuento
    this.porcentajeDescuento = await this.compraServicio.calcularPorcentajeDescuento();
    this.montoDescuento = (this.subtotalCompra * this.porcentajeDescuento) / 100;

    const totalConDescuento = this.subtotalCompra - this.montoDescuento;

    // 4. Crédito de Usuario
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

  async procesarPago() {
    if (this.cargando) return;
    this.cargando = true;

    const resultado = await this.compraServicio.confirmarYGuardarCompra(
      this.subtotalCompra,
      this.creditoAplicado
    );

    this.cargando = false;

    if (resultado.exito) {
      const codigoQR = resultado.codigoQR || '';
      this.codigoQRTexto = codigoQR;

      try {
        // Genera la imagen Base64 del QR al instante en el cliente
        this.qrImageUrl = await QRCode.toDataURL(codigoQR, {
          width: 250,
          margin: 2
        });
      } catch (error) {
        console.error('Error generando el código QR:', error);
      }

      this.mostrarModalQR = true;
    } else {
      alert('Error al guardar la venta en la base de datos. Por favor, reintenta.');
    }
  }

  cerrarModalYFinalizar() {
    this.mostrarModalQR = false;
    this.compraServicio.limpiar();
    this.router.navigate(['/cartelera']);
  }
}