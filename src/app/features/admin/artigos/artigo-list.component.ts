import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArtigoAdminService } from '../../../core/services/artigo-admin.service';
import { ArtigoAdmin, PaginaResult } from '../../../core/models/admin.model';

@Component({
  selector: 'app-artigo-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './artigo-list.component.html',
  styleUrl: '../admin-shared.scss',
})
export class ArtigoListComponent implements OnInit {
  private artigoService = inject(ArtigoAdminService);

  pagina = signal<PaginaResult<ArtigoAdmin> | null>(null);
  carregando = signal(false);
  erro = signal<string | null>(null);
  excluindoId = signal<number | null>(null);

  ngOnInit(): void {
    this.carregar(1);
  }

  carregar(pagina: number): void {
    this.carregando.set(true);
    this.artigoService.listar(pagina).subscribe({
      next: (r) => {
        this.pagina.set(r);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os artigos.');
        this.carregando.set(false);
      },
    });
  }

  excluir(artigo: ArtigoAdmin): void {
    if (!confirm(`Excluir o artigo "${artigo.titulo}"? Essa ação não pode ser desfeita.`)) {
      return;
    }

    this.excluindoId.set(artigo.id);
    this.artigoService.excluir(artigo.id).subscribe({
      next: () => {
        this.excluindoId.set(null);
        this.carregar(this.pagina()?.paginaAtual ?? 1);
      },
      error: () => {
        this.excluindoId.set(null);
        this.erro.set('Não foi possível excluir o artigo.');
      },
    });
  }
}
