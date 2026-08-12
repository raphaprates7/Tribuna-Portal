import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { InstitutionalPageService } from '../../core/services/institutional-page.service';
import { InstitutionalPageData } from '../../core/models/content.model';
import { SeoService } from '../../core/services/seo.service';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ContentSidebarComponent } from '../../shared/components/content-sidebar/content-sidebar.component';

@Component({
  selector: 'app-institutional-page',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, ContentSidebarComponent],
  templateUrl: './institutional-page.component.html',
  styleUrl: './institutional-page.component.scss',
})
export class InstitutionalPageComponent implements OnInit {
  data = signal<InstitutionalPageData | null>(null);

  constructor(
    private route: ActivatedRoute,
    private pageService: InstitutionalPageService,
    private seo: SeoService
  ) {}

  ngOnInit(): void {
    this.route.data
      .pipe(switchMap((routeData) => this.pageService.getPage(routeData['slug'])))
      .subscribe((data) => {
        this.data.set(data);
        this.seo.update({
          title: `${data.title} — Tribuna`,
          description: this.firstParagraph(data),
          path: this.route.snapshot.url.map((s) => s.path).join('/'),
        });
      });
  }

  private firstParagraph(data: InstitutionalPageData): string {
    const block = data.blocks.find((b) => b.type === 'paragraph' || b.type === 'lead');
    if (!block) return 'Tribuna: informação, cultura e negócios com autoridade e independência.';
    if (block.type === 'paragraph') return block.text;
    return block.segments.map((s) => s.text).join('');
  }
}
