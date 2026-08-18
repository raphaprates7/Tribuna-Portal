import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { FeaturedArticle } from '../../../../core/models/home.model';

@Component({
  selector: 'app-hero-featured',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './hero-featured.component.html',
  styleUrl: './hero-featured.component.scss',
})
export class HeroFeaturedComponent {
  @Input({ required: true }) article!: FeaturedArticle;
  @Input() headingTag: 'h1' | 'h2' = 'h1';

  slides(): number[] {
    return Array.from({ length: this.article.slidesCount }, (_, i) => i);
  }
}
