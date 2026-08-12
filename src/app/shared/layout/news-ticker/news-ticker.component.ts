import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeService } from '../../../core/services/home.service';
import { TrendingItem } from '../../../core/models/home.model';
import { IconComponent } from '../../components/icon/icon.component';

@Component({
  selector: 'app-news-ticker',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './news-ticker.component.html',
  styleUrl: './news-ticker.component.scss',
})
export class NewsTickerComponent implements OnInit {
  items = signal<TrendingItem[]>([]);

  constructor(private homeService: HomeService) {}

  ngOnInit(): void {
    this.homeService.getHomePage().subscribe((data) => this.items.set(data.trending));
  }
}
