import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Auth } from './services/auth';

@Component({
  imports: [RouterOutlet, RouterLink, AsyncPipe],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private auth = inject(Auth);
  private router = inject(Router);

  usuario$ = this.auth.currentUser$;

  async onCerrarSesion(): Promise<void> {
    await this.auth.signOut();
    this.router.navigate(['/login']);
  }
}