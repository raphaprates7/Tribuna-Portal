import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ArticleComment } from '../../../../core/models/article.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './comment-section.component.html',
  styleUrl: './comment-section.component.scss',
})
export class CommentSectionComponent {
  private http = inject(HttpClient);

  @Input({ required: true }) articleId!: number;
  @Input({ required: true }) comments!: ArticleComment[];

  name = '';
  email = '';
  message = '';
  saveInfo = false;
  posted = signal(false);
  enviando = signal(false);
  erro = signal<string | null>(null);

  onSubmit(): void {
    if (!this.name || !this.email || !this.message || this.enviando()) {
      return;
    }

    this.erro.set(null);
    this.enviando.set(true);

    this.http
      .post(`${environment.apiBaseUrl}/artigos/${this.articleId}/comentarios`, {
        nome: this.name,
        email: this.email,
        texto: this.message,
      })
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.posted.set(true);
          this.name = '';
          this.email = '';
          this.message = '';
        },
        error: () => {
          this.enviando.set(false);
          this.erro.set('Não foi possível enviar seu comentário. Tente novamente.');
        },
      });
  }
}
