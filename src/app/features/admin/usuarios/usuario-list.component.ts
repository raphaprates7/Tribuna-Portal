import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioAdminService } from '../../../core/services/usuario-admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { UsuarioAdmin } from '../../../core/models/admin.model';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario-list.component.html',
  styleUrl: '../admin-shared.scss',
})
export class UsuarioListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioAdminService);
  private authService = inject(AuthService);

  usuarios = signal<UsuarioAdmin[]>([]);
  erro = signal<string | null>(null);
  salvando = signal(false);
  mostrarForm = signal(false);

  meuId = this.authService.usuario()?.email;

  form = this.fb.nonNullable.group({
    nomeCompleto: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(10)]],
    role: ['Editor' as 'Admin' | 'Editor', [Validators.required]],
  });

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.usuarioService.listar().subscribe({
      next: (u) => this.usuarios.set(u),
      error: () => this.erro.set('Não foi possível carregar os usuários.'),
    });
  }

  criar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.erro.set(null);
    this.salvando.set(true);
    this.usuarioService.criar(this.form.getRawValue()).subscribe({
      next: () => {
        this.salvando.set(false);
        this.mostrarForm.set(false);
        this.form.reset({ nomeCompleto: '', email: '', senha: '', role: 'Editor' });
        this.carregar();
      },
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.mensagem ?? 'Não foi possível criar o usuário.');
      },
    });
  }

  alternarStatus(usuario: UsuarioAdmin): void {
    const novoStatus = !usuario.ativo;
    const acao = novoStatus ? 'reativar' : 'desativar';
    if (!confirm(`Deseja ${acao} a conta de ${usuario.nomeCompleto}?`)) {
      return;
    }

    this.usuarioService.alterarStatus(usuario.id, novoStatus).subscribe({
      next: () => this.carregar(),
      error: (err) => this.erro.set(err?.error?.mensagem ?? 'Não foi possível alterar o status.'),
    });
  }
}
