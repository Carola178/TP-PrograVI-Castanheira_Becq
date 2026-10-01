// admin-candy.ts

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosServicio } from '../../../services/productosServicio';
import { Producto } from '../../../models/productoData';

@Component({
  selector: 'app-admin-candy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-candy.html',
  styleUrls: ['./admin-candy.css']
})
export class AdminCandy implements OnInit {
  productos: Producto[] = [];
  cargando: boolean = false;
  modoEdicion: boolean = false;

  mensajeError: string = '';
  mensajeExito: string = '';

  productoForm: Producto = this.inicializarFormulario();
  categorias: string[] = ['Bebidas', 'Pochoclos', 'Combos', 'Otros'];

  constructor(
    private productosServicio: ProductosServicio,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  // Regla de Negocio: Puntos = 10% del precio
  onPrecioChange() {
    if (this.productoForm.precio && this.productoForm.precio > 0) {
      this.productoForm.puntos_canje = Math.round(this.productoForm.precio * 0.10);
    } else {
      this.productoForm.puntos_canje = 0;
    }
  }

  async cargarProductos() {
    this.cargando = true;
    try {
      this.productos = await this.productosServicio.getProductos();
    } catch (error) {
      console.error('Error al cargar productos:', error);
      this.mensajeError = 'Error al obtener la lista de productos.';
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  inicializarFormulario(): Producto {
    return {
      nombre: '',
      categoria: 'Bebidas',
      descripcion: '',
      imagen_url: '',
      precio: 0,
      puntos_canje: 0,
      combo_especial: false,
      descuento_semanal: ''
    };
  }

  async guardarProducto() {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.productoForm.nombre || !this.productoForm.nombre.trim() || !this.productoForm.precio || this.productoForm.precio <= 0) {
      this.mensajeError = 'Debes completar el nombre y asignar un precio mayor a 0.';
      return;
    }

    // Aseguramos la regla del 10% antes de enviar a la base de datos
    this.productoForm.puntos_canje = Math.round(this.productoForm.precio * 0.10);

    if (this.modoEdicion && this.productoForm.id) {
      const exito = await this.productosServicio.actualizarProducto(this.productoForm.id, this.productoForm);
      if (exito) {
        this.mensajeExito = 'Producto actualizado correctamente.';
        this.cargarProductos();
        this.limpiarFormulario();
      } else {
        this.mensajeError = 'Error al actualizar el producto.';
      }
    } else {
      const exito = await this.productosServicio.crearProducto(this.productoForm);
      if (exito) {
        this.mensajeExito = 'Producto guardado exitosamente con sus puntos (10%).';
        this.cargarProductos();
        this.limpiarFormulario();
      } else {
        this.mensajeError = 'Error al guardar el nuevo producto.';
      }
    }
  }

  editarProducto(prod: Producto) {
    this.limpiarMensajes();
    this.modoEdicion = true;
    this.productoForm = { ...prod };
  }

  async eliminarProducto(id?: number) {
    if (!id) return;
    this.limpiarMensajes();
    
    const exito = await this.productosServicio.eliminarProducto(id);
    if (exito) {
      this.mensajeExito = 'Producto eliminado con éxito.';
      this.cargarProductos();
    } else {
      this.mensajeError = 'Error al eliminar el producto.';
    }
  }

  limpiarFormulario() {
    this.modoEdicion = false;
    this.mensajeError = '';
    this.mensajeExito = '';
    this.productoForm = this.inicializarFormulario();
  }

  limpiarMensajes() {
    this.mensajeError = '';
    this.mensajeExito = '';
  }
}