import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Header } from '@shared/components/header';
import { Footer } from '@shared/components/footer';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'zoo-layout',
  imports: [Header, Footer, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Layout {}
