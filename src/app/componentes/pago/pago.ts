import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CompraServicio } from '../../services/compraServicio';
import * as QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

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
      this.creditoAplicado,
      this.montoDescuento
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
// --------------------Entradas PDF---------------
  descargarPDF() {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("Cine Americano", 20, 20);

    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text("Comprobante de Compra y Acceso", 20, 30);

    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const tituloPelicula = this.resumen?.pelicula?.titulo || this.resumen?.pelicula?.nombre || 'Película';
    doc.text(`Película: ${tituloPelicula}`, 20, 45);
    doc.text(`Código de Acceso: ${this.codigoQRTexto}`, 20, 53);


    doc.text("Asientos:", 20, 65);
    let yPos = 73;
    (this.resumen?.asientos || []).forEach((asiento: any) => {
      doc.text(`- Fila ${asiento.fila}, Butaca ${asiento.columna || asiento.numero}`, 25, yPos);
      yPos += 8;
    });

    if (this.resumen?.candy && this.resumen.candy.length > 0) {
      yPos += 5;
      doc.text("Candy Bar:", 20, yPos);
      yPos += 8;
      this.resumen.candy.forEach((item: any) => {
        const nombre = item?.producto?.nombre || item?.nombre || 'Producto';
        const cantidad = item?.cantidad || 1;
        doc.text(`- ${nombre} (x${cantidad})`, 25, yPos);
        yPos += 8;
      });
    }

    yPos += 10;
    doc.setFontSize(14);
    if (this.montoDescuento > 0) {
      doc.text(`Descuento Aplicado (${this.porcentajeDescuento}%): -$${this.montoDescuento}`, 20, yPos);
      yPos += 8;
    }
    doc.text(`Total Final Pagado: $${this.totalPagar}`, 20, yPos);

    if (this.qrImageUrl) {
      doc.addImage(this.qrImageUrl, 'PNG', 130, 45, 50, 50);
    }
    doc.save(`Entrada-Cine-${this.codigoQRTexto}.pdf`);
  }

  cerrarModalYFinalizar() {
    this.mostrarModalQR = false;
    this.compraServicio.limpiar();
    this.router.navigate(['/cartelera']);
  }
}