import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  mensajeDescuento = '';
  creditoAplicado = 0;
  totalPagar = 0;

  cargando = false;
  precioEntradaBase = 5000;
  precioEntradaVip = 7500;

  mostrarModalQR = false;
  codigoQRTexto = '';
  qrImageUrl = '';

  constructor(
    public compraServicio: CompraServicio,
    private router: Router,
    private cdr: ChangeDetectorRef
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

  // Métodos auxiliares para obtener el nombre y precio del producto de Candy correctamente
  getNombreCandy(item: any): string {
    return item?.producto?.nombre || item?.nombre || 'Producto Candy';
  }

  getPrecioCandy(item: any): number {
    return Number(item?.producto?.precio) || Number(item?.precio) || 0;
  }

  async calcularTotales() {
    this.subtotalEntradas = (this.resumen?.asientos || []).reduce((acc: number, b: any) => {
      const precio = Number(b.precio) || (this.esVip(b) ? this.precioEntradaVip : this.precioEntradaBase);
      return acc + precio;
    }, 0);

    this.subtotalCandy = (this.resumen?.candy || []).reduce((acc: number, p: any) => {
      const precioUnitario = this.getPrecioCandy(p);
      const cantidad = Number(p.cantidad) || 1;
      return acc + (precioUnitario * cantidad);
    }, 0);

    this.subtotalCompra = this.subtotalEntradas + this.subtotalCandy;

    try {
      const rawDescuento = await this.compraServicio.calcularPorcentajeDescuento();
      this.porcentajeDescuento = Number(rawDescuento) || 0;
    } catch {
      this.porcentajeDescuento = 0;
    }

    if (this.porcentajeDescuento > 100) {
      this.porcentajeDescuento = 0;
    }

    if (this.porcentajeDescuento > 0) {
      const usuario = this.compraServicio.usuarioInfo;
      let esMayor = false;

      if (usuario.fechaNacimiento) {
        const hoy = new Date();
        const nacimiento = new Date(usuario.fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
          edad--;
        }
        esMayor = edad >= 18;
      }

      if (esMayor) {
        this.mensajeDescuento = `Descuento para mayores de edad (${this.porcentajeDescuento}%)`;
      } else {
        this.mensajeDescuento = `Descuento de bienvenida por primera compra (${this.porcentajeDescuento}%)`;
      }
    } else {
      this.mensajeDescuento = '';
    }

    this.montoDescuento = (this.subtotalCompra * this.porcentajeDescuento) / 100;
    const totalConDescuento = Math.max(0, this.subtotalCompra - this.montoDescuento);

    const creditoDisponible = Number(this.resumen?.usuario?.creditoDisponible) || 0;
    if (creditoDisponible > 0) {
      this.creditoAplicado = Math.min(creditoDisponible, totalConDescuento);
    } else {
      this.creditoAplicado = 0;
    }

    this.totalPagar = Math.max(0, totalConDescuento - this.creditoAplicado);

    this.cdr.detectChanges();
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
        this.qrImageUrl = await QRCode.toDataURL(codigoQR, {
          width: 250,
          margin: 2
        });
      } catch (error) {
        console.log("Error al generar el QR de la compra");
      }

      this.mostrarModalQR = true;
      this.cdr.detectChanges();
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