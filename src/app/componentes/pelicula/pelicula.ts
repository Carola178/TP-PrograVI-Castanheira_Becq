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
  
  horarioSeleccionado: string | null = null;

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
      
      if (this.pelicula?.horarios && this.pelicula.horarios.length > 0) {
        this.horarioSeleccionado = this.pelicula.horarios[0];
      }
    }
    this.cargando = false;
    this.cdr.detectChanges(); 
  }

  seleccionarHorario(horario: string): void {
    this.horarioSeleccionado = horario;
  }

  iniciarCompra(): void {
    if (this.pelicula && this.horarioSeleccionado) {
      this.compraServicio.seleccionarFuncion({
        ...this.pelicula,
        horarioElegido: this.horarioSeleccionado
      });
      this.router.navigate(['/sala', this.pelicula.id]); 
    }
  }
}