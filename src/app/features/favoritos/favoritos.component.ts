import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoritosService } from '../../core/services/favoritos.service';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, RouterLink, BreadcrumbComponent, IconComponent],
  templateUrl: './favoritos.component.html',
  styleUrl: './favoritos.component.scss',
})
export class FavoritosComponent {
  private favoritosService = inject(FavoritosService);

  favoritos = this.favoritosService.favoritos;

  breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Favoritos', href: '/favoritos' },
  ];

  remover(slug: string): void {
    this.favoritosService.remover(slug);
  }
}
