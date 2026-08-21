import Quill from 'quill';

// Substitui o blot de vídeo padrão do Quill (que só sabe gerar <iframe class="ql-video">)
// por uma versão que também sabe marcar um vídeo como vertical — usado pra Shorts do
// YouTube, que ficam esticados/cortados de forma estranha no formato 16:9 padrão.
// Segue o mesmo mecanismo que o próprio blot já usa pra width/height (um "formato"
// aplicado sobre o embed via format()/formats(), não parte do valor/URL em si), pra
// que a marcação sobreviva corretamente ao salvar e reabrir o artigo pra editar.
const QuillVideo = Quill.import('formats/video') as any;

class VideoComOrientacao extends QuillVideo {
  static formats(domNode: HTMLElement): Record<string, unknown> {
    const formatos = super.formats(domNode) as Record<string, unknown>;
    if (domNode.classList.contains('ql-video--vertical')) {
      formatos['vertical'] = true;
    }
    return formatos;
  }

  format(name: string, value: unknown): void {
    if (name === 'vertical') {
      (this['domNode'] as HTMLElement).classList.toggle('ql-video--vertical', !!value);
    } else {
      super.format(name, value);
    }
  }
}
VideoComOrientacao['blotName'] = 'video';
VideoComOrientacao['className'] = 'ql-video';
VideoComOrientacao['tagName'] = 'IFRAME';

Quill.register(VideoComOrientacao, true);
