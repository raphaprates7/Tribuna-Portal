import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { VerticalAdminService } from '../../../core/services/vertical-admin.service';
import { VerticalAdmin } from '../../../core/models/admin.model';

@Component({
  selector: 'app-vertical-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vertical-list.component.html',
  styleUrl: '../admin-shared.scss',
})
export class VerticalListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private verticalService = inject(VerticalAdminService);

  verticais = signal<VerticalAdmin[]>([]);
  carregando = signal(false);
  salvando = signal(false);
  erro = signal<string | null>(null);
  editandoId = signal<number | null>(null);

  form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(80)]],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/), Validators.maxLength(80)]],
    tagline: [''],
    corAccent: ['#6e1423'],
    temaEscuro: [false],
    ordem: [0],
  });

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.verticalService.listar().subscribe({
      next: (v) => {
        this.verticais.set(v);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar as verticais.');
        this.carregando.set(false);
      },
    });
  }

  editar(vertical: VerticalAdmin): void {
    this.editandoId.set(vertical.id);
    this.form.patchValue({
      nome: vertical.nome,
      slug: vertical.slug,
      tagline: vertical.tagline ?? '',
      corAccent: vertical.corAccent ?? '#6e1423',
      temaEscuro: vertical.temaEscuro,
      ordem: vertical.ordem,
    });
  }

  cancelarEdicao(): void {
    this.editandoId.set(null);
    this.form.reset({ nome: '', slug: '', tagline: '', corAccent: '#6e1423', temaEscuro: false, ordem: 0 });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.erro.set(null);
    this.salvando.set(true);
    const valorForm = this.form.getRawValue();
    const valor = {
      nome: valorForm.nome,
      slug: valorForm.slug,
      tagline: valorForm.tagline || null,
      corAccent: valorForm.corAccent || null,
      temaEscuro: valorForm.temaEscuro,
      ordem: valorForm.ordem,
    };

    const aoConcluir = () => {
      this.salvando.set(false);
      this.cancelarEdicao();
      this.carregar();
    };
    const aoFalhar = (err: { error?: { mensagem?: string } }) => {
      this.salvando.set(false);
      this.erro.set(err?.error?.mensagem ?? 'Não foi possível salvar a vertical.');
    };

    const id = this.editandoId();
    if (id) {
      this.verticalService.atualizar(id, valor).subscribe({ next: aoConcluir, error: aoFalhar });
    } else {
      this.verticalService.criar(valor).subscribe({ next: aoConcluir, error: aoFalhar });
    }
  }

  excluir(vertical: VerticalAdmin): void {
    if (!confirm(`Excluir a vertical "${vertical.nome}"?`)) {
      return;
    }

    this.verticalService.excluir(vertical.id).subscribe({
      next: () => this.carregar(),
      error: (err) => this.erro.set(err?.error?.mensagem ?? 'Não foi possível excluir a vertical.'),
    });
  }
}
