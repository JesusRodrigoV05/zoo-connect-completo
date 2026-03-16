import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MainContainer } from '@app/shared/components/main-container';

@Component({
  selector: 'zoo-gestion-reportes',
  imports: [MainContainer],
  templateUrl: './gestion-reportes.html',
  styleUrl: './gestion-reportes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class GestionReportes {

}
