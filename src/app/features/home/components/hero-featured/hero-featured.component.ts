import { Component, Input, OnChanges, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { FeaturedArticle } from '../../../../core/models/home.model';

const INTERVALO_AUTO_MS = 7000;

@Component({
  selector: 'app-hero-featured',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './hero-featured.component.html',
  styleUrl: './hero-featured.component.scss',
})
export class HeroFeaturedComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) articles!: FeaturedArticle[];

  active = signal(0);
  private timer: ReturnType<typeof setInterval> | null = null;

  get atual(): FeaturedArticle | null {
    return this.articles?.[this.active()] ?? null;
  }

  ngOnChanges(): void {
    this.active.set(0);
    this.reiniciarAutoAvanco();
  }

  ngOnDestroy(): void {
    this.pararAutoAvanco();
  }

  irPara(indice: number): void {
    this.active.set(indice);
    this.reiniciarAutoAvanco();
  }

  proximo(): void {
    if (!this.articles?.length) {
      return;
    }
    this.active.update((i) => (i + 1) % this.articles.length);
  }

  anterior(): void {
    if (!this.articles?.length) {
      return;
    }
    this.active.update((i) => (i - 1 + this.articles.length) % this.articles.length);
    this.reiniciarAutoAvanco();
  }

  onProximoClick(): void {
    this.proximo();
    this.reiniciarAutoAvanco();
  }

  private reiniciarAutoAvanco(): void {
    this.pararAutoAvanco();
    if (this.articles?.length > 1) {
      this.timer = setInterval(() => this.proximo(), INTERVALO_AUTO_MS);
    }
  }

  private pararAutoAvanco(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
