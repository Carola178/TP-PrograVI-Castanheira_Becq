import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ProductoCandy {
  id: number;
  nombre: string;
  categoria: 'Pochoclos' | 'Bebidas' | 'Otros' | 'Combos';
  descripcion: string;
  precio: number;
  puntosCanje?: number; 
  imagen: string;
  esComboEspecial?: boolean; 
  descuentoSemanal?: string;
}

@Component({
  selector: 'app-candy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candy.html',
  styleUrl: './candy.css'
})
export class Candy {
  categoriaSeleccionada: string = 'Todos';
  categorias: string[] = ['Todos', 'Pochoclos', 'Bebidas', 'Otros'];

  ofertasSemanales: ProductoCandy[] = [
    {
      id: 101,
      nombre: 'Combo Pareja',
      categoria: 'Combos',
      descripcion: '1 Pochoclo Gigante + 2 Bebidas Grandes (500ml)',
      precio: 8500,
      puntosCanje: 1200,
      imagen: 'assets/combo-pareja.webp',
      esComboEspecial: true,
      descuentoSemanal: '20% OFF'
    },
    {
      id: 102,
      nombre: 'Combo Mega Cine',
      categoria: 'Combos',
      descripcion: '2 Entradas + 1 Pochoclo Balde + 2 Gaseosas + 1 Chocolatina',
      precio: 14000,
      puntosCanje: 2000,
      imagen: 'assets/combo-mega-cine.webp',
      esComboEspecial: true,
      descuentoSemanal: 'OFERTA DESTACADA'
    },
    {
      id: 103,
      nombre: 'Combo Kids',
      categoria: 'Combos',
      descripcion: '1 Pochoclo Chico + 1 Jugo + 1 Golosina a elección',
      precio: 5200,
      puntosCanje: 800,
      imagen: 'assets/combo-kids.webp',
      esComboEspecial: true,
      descuentoSemanal: '15% OFF'
    }
  ];

  productos: ProductoCandy[] = [
    {
      id: 1,
      nombre: 'Pochoclos Salados (Balde)',
      categoria: 'Pochoclos',
      descripcion: 'Balde de pochoclos recién hechos.',
      precio: 4500,
      puntosCanje: 600,
      imagen: 'assets/pochoclos-salados.webp'
    },
    {
      id: 2,
      nombre: 'Pochoclos Dulces (Balde)',
      categoria: 'Pochoclos',
      descripcion: 'Balde de pochoclos acaramelados.',
      precio: 4800,
      puntosCanje: 650,
      imagen: 'assets/pochoclos-dulces.webp'
    },
    {
      id: 3,
      nombre: 'Gaseosa Línea Coca-Cola 500ml',
      categoria: 'Bebidas',
      descripcion: 'Sabor a elección: Coca-Cola, Sprite, Fanta.',
      precio: 2500,
      puntosCanje: 350,
      imagen: 'assets/gaseosas.jpeg'
    },
    {
      id: 4,
      nombre: 'Agua Mineral 500ml',
      categoria: 'Bebidas',
      descripcion: 'Con o sin gas.',
      precio: 1800,
      puntosCanje: 250,
      imagen: 'assets/agua-mineral.webp'
    },
    {
      id: 5,
      nombre: 'M&M Chocolate 150g',
      categoria: 'Otros',
      descripcion: 'Confites de chocolate con leche.',
      precio: 3000,
      puntosCanje: 400,
      imagen: 'assets/m&m.webp'
    },
    {
      id: 6,
      nombre: 'Nachos con Queso Cheddar',
      categoria: 'Otros',
      descripcion: 'Porción de nachos crujientes con salsa cheddar tibia.',
      precio: 3800,
      puntosCanje: 500,
      imagen: 'assets/nachos-cheddar.jpg'
    },
    {
      id: 7,
      nombre: 'Pancho con Gaseosa',
      categoria: 'Otros',
      descripcion: 'Pancho gigante con aderezos y gaseosa de 500ml.',
      precio: 4200,
      puntosCanje: 550,
      imagen: 'assets/pancho.jpg'
    },
    {
      id: 8,
      nombre: 'Tequeños de Queso',
      categoria: 'Otros',
      descripcion: 'Porción de 5 tequeños rellenos de queso con dip de salsa.',
      precio: 4100,
      puntosCanje: 520,
      imagen: 'assets/tequeños.jpg'
    }
  ];

  get productosFiltrados(): ProductoCandy[] {
    if (this.categoriaSeleccionada === 'Todos') {
      return this.productos;
    }
    return this.productos.filter(p => p.categoria === this.categoriaSeleccionada);
  }
}