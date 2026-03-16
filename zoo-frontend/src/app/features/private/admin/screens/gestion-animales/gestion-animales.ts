import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SplitterLayout } from '../../components/splitter-layout';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MenuButton } from '../../models';
import { ButtonModule } from 'primeng/button';
import { MainContainer } from '@app/shared/components/main-container';
import { NavMenuGestion } from '../../components/nav-menu-gestion';

@Component({
  selector: 'app-gestion-animales',
  imports: [
    ButtonModule,
    RouterOutlet,
    SplitterLayout,
    MainContainer,
    NavMenuGestion,
  ],
  templateUrl: './gestion-animales.html',
  styleUrl: './gestion-animales.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GestionAnimales {
  private readonly rutaAdmin = '/admin/animales';
  private readonly rutaEspecies = `${this.rutaAdmin}/especies`;
  private readonly rutaHabitats = `${this.rutaAdmin}/habitat`;

  protected readonly buttons: MenuButton[] = [
    {
      texto: 'Lista de Especies',
      ruta: `${this.rutaEspecies}/lista`,
      icono: 'pi pi-list',
      descripcion: 'Ver todas las especies registradas',
      exacto: true,
    },
    {
      texto: 'Añadir Especie',
      ruta: `${this.rutaEspecies}/crear`,
      icono: 'pi pi-plus',
      descripcion: 'Crear una nueva especie',
      exacto: false,
    },
    {
      texto: 'Lista de Hábitats',
      ruta: `${this.rutaHabitats}/lista`,
      icono: 'pi pi-map-marker',
      descripcion: 'Ver todos los hábitats',
      exacto: true,
    },
    {
      texto: 'Añadir Hábitat',
      ruta: `${this.rutaHabitats}/crear`,
      icono: 'pi pi-image',
      descripcion: 'Crear un nuevo hábitat',
      exacto: false,
    },
    {
      texto: 'Lista de Animales',
      ruta: `${this.rutaAdmin}/lista`,
      icono: 'pi pi-users',
      descripcion: 'Ver y gestionar todos los animales',
      exacto: true,
    },
    {
      texto: 'Añadir Animal',
      ruta: `${this.rutaAdmin}/crear`,
      icono: 'pi pi-plus-circle',
      descripcion: 'Registrar un nuevo animal',
      exacto: false,
    },
  ];
}
