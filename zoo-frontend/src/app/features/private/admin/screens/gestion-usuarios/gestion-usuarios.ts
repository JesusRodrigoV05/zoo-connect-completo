import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SplitterLayout } from '../../components/splitter-layout';
import { MenuButton } from '../../models';
import { MainContainer } from '@app/shared/components/main-container';
import { NavMenuGestion } from '../../components/nav-menu-gestion';

@Component({
  selector: 'app-gestion-usuarios',
  imports: [
    RouterOutlet,
    ButtonModule,
    SplitterLayout,
    MainContainer,
    NavMenuGestion,
  ],
  templateUrl: './gestion-usuarios.html',
  styleUrl: './gestion-usuarios.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GestionUsuarios {
  private readonly router = inject(Router);

  protected readonly buttons: MenuButton[] = [
    {
      icono: 'pi pi-user-plus',
      texto: 'Crear Usuario',
      descripcion: 'Agregar nuevo usuario al sistema',
      ruta: '/admin/usuarios/crear',
      exacto: false,
    },
    {
      icono: 'pi pi-users',
      texto: 'Lista de Usuarios',
      descripcion: 'Ver y gestionar usuarios existentes',
      ruta: '/admin/usuarios',
      exacto: true,
    },
  ];

  protected isActive(url: string): boolean {
    return this.router.isActive(url, {
      paths: 'exact',
      queryParams: 'exact',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }
}
