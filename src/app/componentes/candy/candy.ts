import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ProductosServicio } from '../../services/productosServicio';
import { CompraServicio } from '../../services/compraServicio';

@Component({
  selector: 'app-candy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candy.html',
  styleUrl: './candy.css'
})
export class Candy implements OnInit {
  productosCandy: any[] = [];
  categoriaSeleccionada: string = 'Todos';
  categorias: string[] = ['Todos', 'Pochoclos', 'Bebidas', 'Otros'];

  constructor(
    private productosServicio: ProductosServicio,
    public compraServicio: CompraServicio, 
    private router: Router,                
    private cdr: ChangeDetectorRef 
  ) {}

  async ngOnInit() {
    try {
      const data = await this.productosServicio.getProductos();
      this.productosCandy = data || [];
      this.cdr.detectChanges(); 
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  }

  get ofertasSemanales(): any[] {
    return this.productosCandy.filter(p => p.combo_especial === true);
  }

  get productosFiltrados(): any[] {
    if (!this.productosCandy || this.productosCandy.length === 0) {
      return [];
    }

    if (this.categoriaSeleccionada === 'Todos') {
      return this.productosCandy;
    }

    return this.productosCandy.filter(p => 
      p.categoria?.toLowerCase().trim() === this.categoriaSeleccionada.toLowerCase().trim()
    );
  }

  agregarCandy(producto: any) {
    this.compraServicio.agregarProductoCandy({
      ...producto,
      cantidad: 1
    });
  }

  obtenerCantidadCarrito(productoId: any): number {
    const resumen = this.compraServicio.getResumenCompra();
    const item = (resumen?.candy || []).find((p: any) => p.id === productoId);
    return item?.cantidad ?? 0; 
  }

  IrAlPago() {
    this.router.navigate(['/pago']);
  }
}