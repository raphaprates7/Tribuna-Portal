import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriaAdminService } from '../../../core/services/categoria-admin.service';
import { CategoriaAdmin } from '../../../core/models/admin.model';

@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categoria-list.component.html',
  styleUrl: '../admin-shared.scss',
})
export class CategoriaListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoriaService = inject(CategoriaAdminService);

  categorias = signal<CategoriaAdmin[]>([]);
  carregando = signal(false);
  salvando = signal(false);
  erro = signal<string | null>(null);
  editandoId = signal<number | null>(null);

  form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(80)]],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/), Validators.maxLength(80)]],
  });

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.categoriaService.listar().subscribe({
      next: (c) => {
        this.categorias.set(c);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar as categorias.');
        this.carregando.set(false);
      },
    });
  }

  editar(categoria: CategoriaAdmin): void {
    this.editandoId.set(categoria.id);
    this.form.patchValue({ nome: categoria.nome, slug: categoria.slug });
  }

  cancelarEdicao(): void {
    this.editandoId.set(null);
    this.form.reset({ nome: '', slug: '' });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.erro.set(null);
    this.salvando.set(true);
    const valor = this.form.getRawValue();

    const aoConcluir = () => {
      this.salvando.set(false);
      this.cancelarEdicao();
      this.carregar();
    };
    const aoFalhar = (err: { error?: { mensagem?: string } }) => {
      this.salvando.set(false);
      this.erro.set(err?.error?.mensagem ?? 'Não foi possível salvar a categoria.');
    };

    const id = this.editandoId();
    if (id) {
      this.categoriaService.atualizar(id, valor).subscribe({ next: aoConcluir, error: aoFalhar });
    } else {
      this.categoriaService.criar(valor).subscribe({ next: aoConcluir, error: aoFalhar });
    }
  }

  excluir(categoria: CategoriaAdmin): void {
    if (!confirm(`Excluir a categoria "${categoria.nome}"?`)) {
      return;
    }

    this.categoriaService.excluir(categoria.id).subscribe({
      next: () => this.carregar(),
      error: (err) => this.erro.set(err?.error?.mensagem ?? 'Não foi possível excluir a categoria.'),
    });
  }
}
