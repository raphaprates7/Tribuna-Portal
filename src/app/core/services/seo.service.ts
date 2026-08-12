import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

const SITE_URL = 'https://tribuna-portal.vercel.app';
const DEFAULT_IMAGE = `${SITE_URL}/assets/images/tribuna-logo.png`;

export interface SeoData {
  title: string;
  description: string;
  image?: string | null;
  path?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private titleService = inject(Title);
  private meta = inject(Meta);

  update(data: SeoData): void {
    const image = data.image ? `${SITE_URL}/${data.image.replace(/^\//, '')}` : DEFAULT_IMAGE;
    const url = data.path ? `${SITE_URL}${data.path}` : SITE_URL;

    this.titleService.setTitle(data.title);
    this.meta.updateTag({ name: 'description', content: data.description });
    this.meta.updateTag({ property: 'og:title', content: data.title });
    this.meta.updateTag({ property: 'og:description', content: data.description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ name: 'twitter:title', content: data.title });
    this.meta.updateTag({ name: 'twitter:description', content: data.description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
  }
}
