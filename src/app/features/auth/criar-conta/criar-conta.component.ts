import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AuthService } from '../../../core/services/auth.service';
import { extrairMensagemErro } from '../../../core/utils/erro.util';

@Component({
  selector: 'app-criar-conta',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbComponent, ButtonComponent],
  templateUrl: './criar-conta.component.html',
  styleUrl: './criar-conta.component.scss',
})
export class CriarContaComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Criar conta', href: '/criar-conta' },
  ];

  nomeCompleto = '';
  email = '';
  senha = '';
  submitting = signal(false);
  error = signal<string | null>(null);

  onSubmit(): void {
    if (!this.nomeCompleto || !this.email || !this.senha) {
      this.error.set('Preencha todos os campos para continuar.');
      return;
    }
    if (this.senha.length < 10) {
      this.error.set('A senha precisa ter pelo menos 10 caracteres.');
      return;
    }

    this.error.set(null);
    this.submitting.set(true);

    this.authService.cadastrar({ nomeCompleto: this.nomeCompleto, email: this.email, senha: this.senha }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigateByUrl('/');
      },
      error: (erro: HttpErrorResponse) => {
        this.submitting.set(false);
        this.error.set(extrairMensagemErro(erro, 'Não foi possível criar a conta. Tente novamente.'));
      },
    });
  }
}
