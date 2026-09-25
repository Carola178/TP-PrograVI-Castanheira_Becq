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
  resumen: any;
  precioEntradaBase = 5000;
  precioEntradaVip = 7000; 

  subtotalEntradas = 0;
  subtotalCandy = 0;
  descuentoPrimeraCompra = 0.20; 
  totalPagar = 0;

  constructor(
    private compraServicio: CompraServicio,
    private router: Router
  ) {}

  ngOnInit() {
    this.resumen = this.compraServicio.getResumenCompra();
    this.calcularTotales();
  }

  calcularTotales() {
    this.subtotalEntradas = this.resumen.asientos.reduce((acc: number, b: any) => {
      return acc + (b.esVip ? this.precioEntradaVip : this.precioEntradaBase);
    }, 0);

    this.subtotalCandy = this.resumen.candy.reduce((acc: number, p: any) => {
      return acc + (p.precio * p.cantidad);
    }, 0);

    this.totalPagar = this.subtotalEntradas + this.subtotalCandy;
  }

  procesarPago() {
    alert('Compra procesada exitosamente.');
    this.compraServicio.limpiar();
    this.router.navigate(['/']);
  }
}