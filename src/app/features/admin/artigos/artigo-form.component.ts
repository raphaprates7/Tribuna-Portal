import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { ArtigoAdminService } from '../../../core/services/artigo-admin.service';
import { CategoriaAdminService } from '../../../core/services/categoria-admin.service';
import { VerticalAdminService } from '../../../core/services/vertical-admin.service';
import { UploadService } from '../../../core/services/upload.service';
import { CategoriaAdmin, VerticalAdmin } from '../../../core/models/admin.model';

@Component({
  selector: 'app-artigo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, QuillModule],
  templateUrl: './artigo-form.component.html',
  styleUrl: '../admin-shared.scss',
})
export class ArtigoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private artigoService = inject(ArtigoAdminService);
  private categoriaService = inject(CategoriaAdminService);
  private verticalService = inject(VerticalAdminService);
  private uploadService = inject(UploadService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private artigoId: number | null = null;

  verticais = signal<VerticalAdmin[]>([]);
  categorias = signal<CategoriaAdmin[]>([]);
  salvando = signal(false);
  enviandoCapa = signal(false);
  erro = signal<string | null>(null);

  // Toolbar do Quill: o suficiente para um artigo de portal de notícias —
  // títulos, ênfase, listas, citação, link e imagem (upload real, sem base64).
  quillModules = {
    toolbar: {
      container: [
        [{ header: [2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ align: [] }],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean'],
      ],
      handlers: {
        image: () => this.abrirSeletorImagemInline(),
      },
    },
  };

  private quillInstance: any = null;

  form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(200)]],
    subtitulo: [''],
    resumo: ['', [Validators.required, Validators.maxLength(500)]],
    conteudoHtml: ['', [Validators.required]],
    imagemCapaUrl: [''],
    verticalId: [0, [Validators.required, Validators.min(1)]],
    categoriaId: this.fb.control<number | null>(null),
    autorExibicao: [''],
    destaque: [false],
    patrocinado: [false],
    publicada: [false],
  });

  get modoEdicao(): boolean {
    return this.artigoId !== null;
  }

  ngOnInit(): void {
    this.verticalService.listar().subscribe((v) => this.verticais.set(v));
    this.categoriaService.listar().subscribe((c) => this.categorias.set(c));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.artigoId = Number(idParam);
      this.artigoService.obter(this.artigoId).subscribe({
        next: (artigo) => {
          this.form.patchValue({
            titulo: artigo.titulo,
            subtitulo: artigo.subtitulo ?? '',
            resumo: artigo.resumo,
            conteudoHtml: artigo.conteudoHtml,
            imagemCapaUrl: artigo.imagemCapaUrl ?? '',
            verticalId: artigo.verticalId,
            categoriaId: artigo.categoriaId,
            autorExibicao: artigo.autorExibicao ?? '',
            destaque: artigo.destaque,
            patrocinado: artigo.patrocinado,
            publicada: artigo.publicada,
          });
        },
        error: () => this.erro.set('Não foi possível carregar o artigo.'),
      });
    }
  }

  onEditorCreated(editor: unknown): void {
    this.quillInstance = editor;
  }

  private abrirSeletorImagemInline(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/webp,image/gif';
    input.onchange = () => {
      const arquivo = input.files?.[0];
      if (!arquivo) {
        return;
      }
      this.uploadService.enviarImagem(arquivo).subscribe({
        next: (url) => {
          const selecao = this.quillInstance?.getSelection(true);
          const index = selecao ? selecao.index : this.quillInstance?.getLength() ?? 0;
          this.quillInstance?.insertEmbed(index, 'image', url, 'user');
          this.quillInstance?.setSelection(index + 1, 0);
        },
        error: () => this.erro.set('Falha ao enviar a imagem. Tente novamente.'),
      });
    };
    input.click();
  }

  onCapaSelecionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (!arquivo) {
      return;
    }

    this.enviandoCapa.set(true);
    this.uploadService.enviarImagem(arquivo).subscribe({
      next: (url) => {
        this.form.patchValue({ imagemCapaUrl: url });
        this.enviandoCapa.set(false);
      },
      error: () => {
        this.erro.set('Falha ao enviar a imagem de capa.');
        this.enviandoCapa.set(false);
      },
    });
    input.value = '';
  }

  removerCapa(): void {
    this.form.patchValue({ imagemCapaUrl: '' });
  }

  salvar(publicarAgora: boolean | null = null): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.erro.set('Preencha os campos obrigatórios antes de salvar.');
      return;
    }

    this.erro.set(null);
    this.salvando.set(true);

    const valorForm = this.form.getRawValue();
    const valor = {
      titulo: valorForm.titulo,
      subtitulo: valorForm.subtitulo || null,
      resumo: valorForm.resumo,
      conteudoHtml: valorForm.conteudoHtml,
      imagemCapaUrl: valorForm.imagemCapaUrl || null,
      verticalId: valorForm.verticalId,
      categoriaId: valorForm.categoriaId,
      autorExibicao: valorForm.autorExibicao || null,
      destaque: valorForm.destaque,
      patrocinado: valorForm.patrocinado,
      publicada: publicarAgora ?? valorForm.publicada,
    };

    const operacao = this.modoEdicao
      ? this.artigoService.atualizar(this.artigoId!, valor)
      : this.artigoService.criar(valor);

    operacao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.router.navigateByUrl('/admin/artigos');
      },
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.mensagem ?? 'Não foi possível salvar o artigo.');
      },
    });
  }
}
