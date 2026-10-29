import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; 
import { PeliculaData } from '../../models/peliculaData';
import { PeliculaServicio } from '../../services/peliculaServicio';
import { CompraServicio } from '../../services/compraServicio'; 
import { ReseniaServicio } from '../../services/reseniaServicio'; 
import { Resenia } from '../../models/reseniaData'; 
import { Auth } from '../../services/auth'; 

@Component({
  selector: 'app-pelicula',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './pelicula.html',
  styleUrl: './pelicula.css'
})
export class Pelicula implements OnInit {
  pelicula: PeliculaData | null = null;
  cargando: boolean = true;
  horarioSeleccionado: string | null = null;

  // Variables para las reseñas
  reviews: Resenia[] = [];
  averageRating: number = 0;
  totalReviews: number = 0;
  selectedRating: number = 5;
  comentarioText: string = '';
  isSubmitting: boolean = false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router, 
    private peliculaServicio: PeliculaServicio,
    private compraServicio: CompraServicio,
    private reseniaServicio: ReseniaServicio,
    private auth: Auth,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.pelicula = await this.peliculaServicio.getPeliculaPorId(id);
      
      if (this.pelicula?.horarios && this.pelicula.horarios.length > 0) {
        this.horarioSeleccionado = this.pelicula.horarios[0];
      }

      // Cargamos las reseñas y promedios de esta película específica
      await this.loadReviews(Number(id));
    }
    this.cargando = false;
    this.cdr.detectChanges(); 
  }

  // Cargar reseñas desde Supabase
  async loadReviews(peliculaId: number) {
    try {
      this.reviews = await this.reseniaServicio.getReviewsByMovie(peliculaId);
      const summary = await this.reseniaServicio.getMovieRatingSummary(peliculaId);
      this.averageRating = summary.average;
      this.totalReviews = summary.count;
    } catch (err) {
      console.error('Error al cargar reseñas:', err);
    }
  }

  setRating(stars: number) {
    this.selectedRating = stars;
  }

  // Enviar nueva reseña
  async submitReview() {
    if (!this.comentarioText.trim()) {
      this.errorMessage = 'Escribe un comentario corto.';
      return;
    }

    const currentUser = await this.auth.getUsuarioActual();
    if (!currentUser) {
      this.errorMessage = 'Debes iniciar sesión para calificar.';
      return;
    }

    if (!this.pelicula || !this.pelicula.id) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      await this.reseniaServicio.addReview({
        peliculaid: Number(this.pelicula.id),
        usuarioid: currentUser.id,
        rating: this.selectedRating,
        comentario: this.comentarioText.trim()
      });

      this.comentarioText = '';
      this.selectedRating = 5;
      await this.loadReviews(Number(this.pelicula.id)); 
    } catch (err: any) {
      if (err.code === '23505') {
        this.errorMessage = 'Ya has dejado una reseña para esta película.';
      } else {
        this.errorMessage = 'Error al publicar la reseña.';
      }
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
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