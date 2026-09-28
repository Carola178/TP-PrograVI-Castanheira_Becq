import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; 
import { PeliculaData } from '../../models/peliculaData';
import { PeliculaServicio } from '../../services/peliculaServicio';
import { CompraServicio } from '../../services/compraServicio'; 

@Component({
  selector: 'app-pelicula',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pelicula.html',
  styleUrl: './pelicula.css'
})
export class Pelicula implements OnInit {
  pelicula: PeliculaData | null = null;
  cargando: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router, 
    private peliculaServicio: PeliculaServicio,
    private compraServicio: CompraServicio,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.pelicula = await this.peliculaServicio.getPeliculaPorId(id);
    }
    this.cargando = false;
    this.cdr.detectChanges(); 
  }

  iniciarCompra(): void {
    if (this.pelicula) {
      this.compraServicio.seleccionarFuncion(this.pelicula);
      this.router.navigate(['/sala', this.pelicula.id]); 
    }
  }
}