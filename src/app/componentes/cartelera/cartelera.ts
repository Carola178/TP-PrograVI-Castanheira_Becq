import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { PeliculaData } from '../../models/peliculaData';
import { PeliculaServicio } from '../../services/peliculaServicio';
import { CompraServicio } from '../../services/compraServicio';
import { Auth } from '../../services/auth'; // Adjust path if needed

@Component({
  selector: 'app-cartelera',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cartelera.html',
  styleUrl: './cartelera.css'
})
export class Cartelera implements OnInit, OnDestroy {
  busqueda: string = '';
  generoSeleccionado: string = 'Todos';
  generosDisponibles: string[] = ['Todos', 'Acción', 'Aventura', 'Drama', 'Ciencia Ficción', 'Terror'];

  peliculas: PeliculaData[] = [];
  private peliculasSub!: Subscription;

  constructor(
    private peliculaServicio: PeliculaServicio,
    private compraServicio: CompraServicio,
    private auth: Auth, // Inyectamos el servicio de autenticación
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.peliculasSub = this.peliculaServicio.peliculas$.subscribe({
      next: (datos: PeliculaData[]) => {
        console.log('Películas mostradas en Cartelera:', datos);
        this.peliculas = datos;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Error en la suscripción:', err);
      }
    });

    this.cargarCartelera();
  }

  cargarCartelera(): void {
    this.peliculaServicio.getPeliculas()
      .then((datos: PeliculaData[]) => {
      })
      .catch((err: unknown) => {
        console.error('Error al traer películas de la BDD:', err);
      });
  }

  ngOnDestroy(): void {
    if (this.peliculasSub) {
      this.peliculasSub.unsubscribe();
    }
  }

  get masVendidas(): PeliculaData[] {
    return this.peliculas ? this.peliculas.slice(0, 3) : [];
  }

  get peliculasFiltradas(): PeliculaData[] {
    if (!this.peliculas) return [];

    return this.peliculas.filter(p => {
      const coincideTitulo = p.titulo 
        ? p.titulo.toLowerCase().includes(this.busqueda.toLowerCase()) 
        : true;

      let coincideGenero = true;
      if (this.generoSeleccionado !== 'Todos') {
        const generosTexto = String(p.generos || '');
        coincideGenero = generosTexto.toLowerCase().includes(this.generoSeleccionado.toLowerCase());
      }

      return coincideTitulo && coincideGenero;
    });
  }
  async seleccionarPelicula(pelicula: PeliculaData, irASala: boolean = true): Promise<void> {
    if (pelicula.esMayor18) {
      const usuario = await this.auth.getUsuarioActual();

      if (!usuario) {
        alert('Debes iniciar sesión para acceder a películas clasificadas como +18.');
        return;
      }

      if (!usuario.fechaNacimiento) {
        alert('Debes indicar tu fecha de nacimiento en tu perfil para continuar.');
        return;
      }

      const edad = this.calcularEdad(usuario.fechaNacimiento);
      if (edad < 16) {
        alert('Acceso restringido: Esta película es para mayores de 18 años y debes tener al menos 16 años para continuar.');
        return;
      }
    }

    this.compraServicio.seleccionarFuncion(pelicula);



    if (irASala) {
      this.router.navigate(['/sala', pelicula.id]); 
    } else {
      this.router.navigate(['/cartelera/pelicula', pelicula.id]);
    }
  }

  private calcularEdad(fechaNacimiento: string | Date): number {
    const hoy = new Date();
    const cumple = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - cumple.getFullYear();
    const mes = hoy.getMonth() - cumple.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < cumple.getDate())) {
      edad--;
    }
    return edad;
  }
}