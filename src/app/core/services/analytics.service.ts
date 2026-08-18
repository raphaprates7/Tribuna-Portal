import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Carrega o Google Analytics (GA4) e registra page views a cada troca de rota. */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private router = inject(Router);
  private measurementId = environment.gaMeasurementId;

  init(): void {
    if (!this.isBrowser || !this.measurementId) {
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer ?? [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', this.measurementId, { send_page_view: false });

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      const navigationEnd = event as NavigationEnd;
      window.gtag?.('event', 'page_view', {
        page_path: navigationEnd.urlAfterRedirects,
      });
    });
  }
}
