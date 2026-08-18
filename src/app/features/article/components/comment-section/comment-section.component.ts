import { Component, Input, OnChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ArticleComment } from '../../../../core/models/article.model';
import { AuthService } from '../../../../core/services/auth.service';
import { ComentarioService } from '../../../../core/services/comentario.service';

@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './comment-section.component.html',
  styleUrl: './comment-section.component.scss',
})
export class CommentSectionComponent implements OnChanges {
  private authService = inject(AuthService);
  private comentarioService = inject(ComentarioService);

  @Input({ required: true }) articleId!: number;
  @Input({ required: true }) comments!: ArticleComment[];

  usuario = this.authService.usuario;

  lista = signal<ArticleComment[]>([]);
  message = '';
  posted = signal(false);
  enviando = signal(false);
  erro = signal<string | null>(null);

  ngOnChanges(): void {
    this.lista.set(this.comments ?? []);
  }

  onSubmit(): void {
    if (!this.message.trim() || this.enviando()) {
      return;
    }

    this.erro.set(null);
    this.enviando.set(true);

    this.comentarioService.criar(this.articleId, this.message.trim()).subscribe({
      next: () => {
        this.enviando.set(false);
        this.posted.set(true);
        this.message = '';
      },
      error: () => {
        this.enviando.set(false);
        this.erro.set('Não foi possível enviar seu comentário. Tente novamente.');
      },
    });
  }

  curtir(comentario: ArticleComment): void {
    if (!this.usuario()) {
      return;
    }

    this.comentarioService.curtir(comentario.id).subscribe({
      next: ({ curtido, totalCurtidas }) => {
        this.lista.update((atual) =>
          atual.map((c) => (c.id === comentario.id ? { ...c, curtidoPeloUsuarioAtual: curtido, curtidas: totalCurtidas } : c))
        );
      },
    });
  }
}
