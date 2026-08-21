import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import './quill-video-blot';
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

  artigoId: number | null = null;

  verticais = signal<VerticalAdmin[]>([]);
  categorias = signal<CategoriaAdmin[]>([]);
  salvando = signal(false);
  enviandoCapa = signal(false);
  erro = signal<string | null>(null);

  // Toolbar do Quill: o suficiente para um artigo de portal de notícias —
  // títulos, ênfase, listas, citação, link, imagem (upload real, sem base64)
  // e vídeo (embed do YouTube/Vimeo).
  quillModules = {
    toolbar: {
      container: [
        [{ header: [2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ align: [] }],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image', 'video'],
        ['clean'],
      ],
      handlers: {
        image: () => this.abrirSeletorImagemInline(),
        video: () => this.inserirVideo(),
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

  onEditorCreated(editor: any): void {
    this.quillInstance = editor;

    // Colar de fontes externas (Word, Google Docs, artigos de outros sites)
    // costuma trazer espaço não separável (&nbsp;/ ) no lugar de espaço
    // normal — o texto fica sem quebra de linha correta e, em casos extremos,
    // já estourou a largura da página inteira (ver article-page.component.scss).
    // Só mexe no que é colado, nunca no que é digitado.
    editor.clipboard.addMatcher(Node.TEXT_NODE, (_node: Node, delta: any) => {
      delta.ops = delta.ops.map((op: any) =>
        typeof op.insert === 'string' ? { ...op, insert: op.insert.replace(/\u00A0/g, ' ') } : op
      );
      return delta;
    });
  }

  // Aceita a URL normal que a pessoa copia da barra de endereço (watch,
  // youtu.be, shorts, vimeo.com) e converte pra URL de embed — sem isso o
  // admin teria que descobrir sozinho o formato /embed/ que o player espera.
  // Também identifica Shorts, que são gravados em formato vertical — sem
  // marcar isso, o embed ficaria espremido/cortado no proporção 16:9 padrão.
  // Retorna null se não reconhecer, pra não inserir um iframe de origem
  // arbitrária (o backend também valida isso, mas não faz sentido nem tentar).
  private converterParaUrlEmbed(url: string): { embedUrl: string; vertical: boolean } | null {
    let host: URL;
    try {
      host = new URL(url.trim());
    } catch {
      return null;
    }

    const hostname = host.hostname.replace(/^www\./, '');

    if (hostname === 'youtube.com') {
      const ehShorts = host.pathname.startsWith('/shorts/');
      const id = host.pathname.startsWith('/embed/')
        ? host.pathname.split('/')[2]
        : ehShorts
          ? host.pathname.split('/')[2]
          : host.searchParams.get('v');
      return id ? { embedUrl: `https://www.youtube.com/embed/${id}`, vertical: ehShorts } : null;
    }

    if (hostname === 'youtu.be') {
      const id = host.pathname.split('/')[1];
      return id ? { embedUrl: `https://www.youtube.com/embed/${id}`, vertical: false } : null;
    }

    if (hostname === 'vimeo.com') {
      const id = host.pathname.split('/')[1];
      return id ? { embedUrl: `https://player.vimeo.com/video/${id}`, vertical: false } : null;
    }

    if (hostname === 'player.vimeo.com' && host.pathname.startsWith('/video/')) {
      return { embedUrl: url.trim(), vertical: false };
    }

    return null;
  }

  private inserirVideo(): void {
    const url = window.prompt('Cole o link do vídeo (YouTube ou Vimeo — Shorts também funciona, fica no formato vertical automaticamente):');
    if (!url) {
      return;
    }

    const resultado = this.converterParaUrlEmbed(url);
    if (!resultado) {
      this.erro.set('Link de vídeo não reconhecido. Use um link do YouTube ou do Vimeo.');
      return;
    }

    const selecao = this.quillInstance?.getSelection(true);
    const index = selecao ? selecao.index : this.quillInstance?.getLength() ?? 0;
    this.quillInstance?.insertEmbed(index, 'video', resultado.embedUrl, 'user');
    if (resultado.vertical) {
      this.quillInstance?.formatText(index, 1, 'vertical', true, 'user');
    }
    this.quillInstance?.setSelection(index + 1, 0);
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
