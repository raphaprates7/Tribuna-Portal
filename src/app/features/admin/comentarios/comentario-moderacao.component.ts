import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComentarioAdminService } from '../../../core/services/comentario-admin.service';
import { ComentarioModeracao } from '../../../core/models/admin.model';

@Component({
  selector: 'app-comentario-moderacao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comentario-moderacao.component.html',
  styleUrl: '../admin-shared.scss',
})
export class ComentarioModeracaoComponent implements OnInit {
  private comentarioService = inject(ComentarioAdminService);

  pendentes = signal<ComentarioModeracao[]>([]);
  carregando = signal(false);
  erro = signal<string | null>(null);
  processandoId = signal<number | null>(null);

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.comentarioService.listarPendentes().subscribe({
      next: (c) => {
        this.pendentes.set(c);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os comentários pendentes.');
        this.carregando.set(false);
      },
    });
  }

  aprovar(c: ComentarioModeracao): void {
    this.processandoId.set(c.id);
    this.comentarioService.aprovar(c.id).subscribe({
      next: () => {
        this.processandoId.set(null);
        this.pendentes.update((lista) => lista.filter((item) => item.id !== c.id));
      },
      error: () => {
        this.processandoId.set(null);
        this.erro.set('Não foi possível aprovar o comentário.');
      },
    });
  }

  rejeitar(c: ComentarioModeracao): void {
    if (!confirm('Excluir este comentário permanentemente?')) {
      return;
    }

    this.processandoId.set(c.id);
    this.comentarioService.excluir(c.id).subscribe({
      next: () => {
        this.processandoId.set(null);
        this.pendentes.update((lista) => lista.filter((item) => item.id !== c.id));
      },
      error: () => {
        this.processandoId.set(null);
        this.erro.set('Não foi possível excluir o comentário.');
      },
    });
  }
}
