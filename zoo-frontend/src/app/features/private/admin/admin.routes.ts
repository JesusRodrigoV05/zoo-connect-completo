import { Routes } from '@angular/router';

export default [
  {
    path: 'usuarios',
    title: 'Gestión de Usuarios',
    data: { requiredPermissions: ['manage_users'] },
    loadComponent: () => import('./screens/gestion-usuarios/gestion-usuarios'),
    children: [
      {
        path: 'crear',
        title: 'Crear Usuario',
        data: { requiredPermissions: ['users_create'] },
        loadComponent: () =>
          import('./screens/gestion-usuarios/components/crear-usuario/crear-usuario'),
      },
      {
        path: 'editar/:id',
        title: 'Editar Usuario',
        loadComponent: () =>
          import('./screens/gestion-usuarios/components/crear-usuario/crear-usuario'),
      },
      {
        path: 'lista',
        data: { requiredPermissions: ['users_list'] },
        title: 'Lista de Usuarios',
        loadComponent: () =>
          import('./screens/gestion-usuarios/components/lista-usuarios/lista-usuarios'),
      },
      {
        path: '',
        redirectTo: 'lista',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'animales',
    title: 'Gestión de Animales',
    data: { requiredPermissions: ['manage_animal_catalog'] },
    loadComponent: () => import('./screens/gestion-animales/gestion-animales'),
    children: [
      {
        path: 'crear',
        title: 'Crear Animal',
        data: { requiredPermissions: ['animals_create_animals'] },
        loadComponent: () =>
          import('./screens/gestion-animales/components/animales/crear-animal/crear-animal'),
      },
      {
        path: 'editar/:id',
        title: 'Editar Animal',
        loadComponent: () =>
          import('./screens/gestion-animales/components/animales/crear-animal/crear-animal'),
      },
      {
        path: 'lista',
        title: 'Lista de Animales',
        data: { requiredPermissions: ['animals_list_animals'] },
        loadComponent: () =>
          import('./screens/gestion-animales/components/animales/lista-animales/lista-animales'),
      },
      {
        path: 'especies',
        children: [
          {
            path: 'crear',
            title: 'Crear Especie',
            data: { requiredPermissions: ['animals_create_species'] },
            loadComponent: () =>
              import('./screens/gestion-animales/components/especies/crear-especie/crear-especie'),
          },
          {
            path: 'editar/:id',
            title: 'Editar Especie',
            loadComponent: () =>
              import('./screens/gestion-animales/components/especies/crear-especie/crear-especie'),
          },
          {
            path: 'lista',
            title: 'Lista de Especies',
            data: { requiredPermissions: ['animals_list_species'] },
            loadComponent: () =>
              import('./screens/gestion-animales/components/especies/lista-especies/lista-especies'),
          },
          {
            path: '',
            redirectTo: 'lista',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: 'habitat',
        children: [
          {
            path: 'crear',
            title: 'Crear Habitat',
            data: { requiredPermissions: ['animals_create_habitats'] },
            loadComponent: () =>
              import('./screens/gestion-animales/components/habitat/crear-habitat/crear-habitat'),
          },
          {
            path: 'editar/:id',
            title: 'Editar Habitat',
            loadComponent: () =>
              import('./screens/gestion-animales/components/habitat/crear-habitat/crear-habitat'),
          },
          {
            path: 'lista',
            title: 'Lista de Habitats',
            data: { requiredPermissions: ['animals_list_habitats'] },
            loadComponent: () =>
              import('./screens/gestion-animales/components/habitat/lista-habitats/lista-habitats'),
          },
          {
            path: '',
            redirectTo: 'lista',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: '',
        redirectTo: 'lista',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'dashboard',
    title: 'Dashboard',
    data: { requiredPermissions: ['view_admin_dashboard'] },
    loadComponent: () => import('./screens/dashboard/dashboard'),
  },
  {
    path: 'encuestas',
    title: 'Encuestas',
    data: { requiredPermissions: ['manage_surveys'] },
    loadComponent: () =>
      import('./screens/gestion-encuestas/gestion-encuestas'),
    children: [
      { path: '', redirectTo: 'lista', pathMatch: 'full' },
      {
        path: 'crear',
        title: 'Crear Encuesta',
        data: { requiredPermissions: ['surveys_create'] },
        loadComponent: () =>
          import('./screens/gestion-encuestas/components/crear-encuesta/crear-encuesta'),
      },
      {
        path: 'editar/:id',
        title: 'Editar Encuesta',
        loadComponent: () =>
          import('./screens/gestion-encuestas/components/crear-encuesta/crear-encuesta'),
      },
      {
        path: 'lista',
        title: 'Lista de Encuestas',
        data: { requiredPermissions: ['surveys_list'] },
        loadComponent: () =>
          import('./screens/gestion-encuestas/components/lista-encuestas/lista-encuestas'),
      },
      {
        path: 'stats/:id',
        title: 'Estadísticas de Encuesta',
        loadComponent: () =>
          import('./screens/gestion-encuestas/components/encuesta-stats/encuesta-stats'),
      },
    ],
  },
  {
    path: 'reportes',
    title: 'Gestión de Reportes',
    data: { requiredPermissions: ['view_inventory'] },
    loadComponent: () => import('./screens/gestion-reportes/gestion-reportes'),
  },
  {
    path: 'audit',
    redirectTo: 'audit/seguridad',
    pathMatch: 'full',
  },
  {
    path: 'audit/aplicacion',
    title: 'Log de Aplicación',
    data: {
      requiredPermissions: ['audit_application_logs'],
      logType: 'application',
    },
    loadComponent: () => import('./screens/auditoria/auditoria'),
  },
  {
    path: 'audit/seguridad',
    title: 'Log de Seguridad',
    data: { requiredPermissions: ['audit_security_logs'], logType: 'security' },
    loadComponent: () => import('./screens/auditoria/auditoria'),
  },
  {
    path: 'permisos',
    title: 'Matriz de Roles',
    data: { requiredPermissions: ['manage_permissions'] },
    loadComponent: () => import('./screens/gestion-permisos/gestion-permisos'),
  },
  {
    path: 'matriz-riesgos',
    title: 'Matriz de Riesgos',
    data: { requiredPermissions: ['risk_matrix_access'] },
    loadComponent: () => import('../osi/screens/matriz-riesgos/matriz-riesgos'),
  },
  {
    path: 'roles/crear',
    title: 'Crear Rol',
    data: { requiredPermissions: ['manage_permissions'] },
    loadComponent: () =>
      import('./screens/gestion-roles/components/crear-rol/crear-rol'),
  },
  {
    path: 'roles/editar/:id',
    title: 'Editar Rol',
    data: { requiredPermissions: ['manage_permissions'] },
    loadComponent: () =>
      import('./screens/gestion-roles/components/crear-rol/crear-rol'),
  },
  {
    path: 'roles/permisos/:id',
    title: 'Permisos del Rol',
    data: { requiredPermissions: ['manage_permissions'] },
    loadComponent: () =>
      import('./screens/gestion-roles/components/editar-permisos/editar-permisos'),
  },
  {
    path: 'roles',
    title: 'Roles',
    data: { requiredPermissions: ['manage_permissions'] },
    loadComponent: () => import('./screens/gestion-roles/gestion-roles'),
  },
  {
    path: 'inventario',
    data: { requiredPermissions: ['manage_inventory'] },
    loadComponent: () =>
      import('./screens/gestion-inventario/gestion-inventario'),
    children: [
      {
        path: 'crear',
        data: { requiredPermissions: ['inventory_create_product'] },
        loadComponent: () =>
          import('./screens/gestion-inventario/components/productos/crear-producto/crear-producto'),
      },
      {
        path: 'editar/:id',
        loadComponent: () =>
          import('./screens/gestion-inventario/components/productos/crear-producto/crear-producto'),
      },
      {
        path: 'lista',
        data: { requiredPermissions: ['inventory_list_products'] },
        loadComponent: () =>
          import('./screens/gestion-inventario/components/productos/lista-producto/lista-producto'),
      },
      {
        path: 'tipo',
        children: [
          {
            path: 'lista',
            data: { requiredPermissions: ['inventory_list_types'] },
            loadComponent: () =>
              import('./screens/gestion-inventario/components/tipo-productos/lista-tipos/lista-tipos'),
          },
          {
            path: 'crear',
            loadComponent: () =>
              import('./screens/gestion-inventario/components/tipo-productos/crear-tipo/crear-tipo'),
          },
          {
            path: 'editar/:id',
            loadComponent: () =>
              import('./screens/gestion-inventario/components/tipo-productos/crear-tipo/crear-tipo'),
          },
          {
            path: '',
            redirectTo: 'lista',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: 'proveedor',
        children: [
          {
            path: 'lista',
            data: { requiredPermissions: ['inventory_list_suppliers'] },
            loadComponent: () =>
              import('./screens/gestion-inventario/components/proveedor/lista-proveedor/lista-proveedor'),
          },
          {
            path: 'crear',
            data: { requiredPermissions: ['inventory_create_supplier'] },
            loadComponent: () =>
              import('./screens/gestion-inventario/components/proveedor/crear-proveedor/crear-proveedor'),
          },
          {
            path: 'editar/:id',
            loadComponent: () =>
              import('./screens/gestion-inventario/components/proveedor/crear-proveedor/crear-proveedor'),
          },
          {
            path: '',
            redirectTo: 'lista',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: 'unidades',
        children: [
          {
            path: 'lista',
            data: { requiredPermissions: ['inventory_list_units'] },
            loadComponent: () =>
              import('./screens/gestion-inventario/components/unidades-medida/lista-unidad/lista-unidad'),
          },
          {
            path: 'crear',
            loadComponent: () =>
              import('./screens/gestion-inventario/components/unidades-medida/crear-unidad/crear-unidad'),
          },
          {
            path: 'editar/:id',
            loadComponent: () =>
              import('./screens/gestion-inventario/components/unidades-medida/crear-unidad/crear-unidad'),
          },
          {
            path: '',
            redirectTo: 'lista',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: 'transacciones',
        children: [
          {
            path: '',
            redirectTo: 'lista',
            pathMatch: 'full',
          },
          {
            path: 'lista',
            data: { requiredPermissions: ['inventory_movements_history'] },
            loadComponent: () =>
              import('./screens/gestion-inventario/components/entradas-salidas/historial/historial'),
          },
          {
            path: 'crear-entrada',
            loadComponent: () =>
              import('./screens/gestion-inventario/components/entradas-salidas/crear-entrada/crear-entrada'),
          },
          {
            path: 'crear-salida',
            loadComponent: () =>
              import('./screens/gestion-inventario/components/entradas-salidas/crear-salida/crear-salida'),
          },
        ],
      },
      {
        path: '',
        redirectTo: 'lista',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'tareas',
    data: { requiredPermissions: ['manage_tasks'] },
    loadComponent: () => import('./screens/gestion-tareas/gestion-tareas'),
    children: [
      {
        path: '',
        redirectTo: 'operaciones',
        pathMatch: 'full',
      },
      {
        path: 'operaciones',
        data: { requiredPermissions: ['tasks_operations_board'] },
        loadComponent: () =>
          import('./screens/gestion-tareas/components/tablero/tablero'),
      },
      {
        path: 'planificador',
        children: [
          {
            path: '',
            data: { requiredPermissions: ['tasks_routines_planner'] },
            loadComponent: () =>
              import('./screens/gestion-tareas/components/rutina/planificador/planificador'),
          },
          {
            path: 'crear',
            loadComponent: () =>
              import('./screens/gestion-tareas/components/rutina/crear-rutina/crear-rutina'),
          },
          {
            path: 'editar/:id',
            loadComponent: () =>
              import('./screens/gestion-tareas/components/rutina/crear-rutina/crear-rutina'),
          },
        ],
      },
      {
        path: 'configuracion',
        data: { requiredPermissions: ['tasks_types_config'] },
        loadComponent: () =>
          import('./screens/gestion-tareas/components/configuracion/configuracion'),
      },
    ],
  },
  {
    path: 'noticias',
    loadComponent: () => import('./screens/gestion-noticias/gestion-noticias'),
    children: [
      {
        path: '',
        redirectTo: 'lista',
        pathMatch: 'full',
      },
      {
        path: 'lista',
        loadComponent: () =>
          import('./screens/gestion-noticias/components/lista-noticias/lista-noticias'),
      },
      {
        path: 'crear',
        loadComponent: () =>
          import('./screens/gestion-noticias/components/crear-noticia/crear-noticia'),
      },
      {
        path: 'editar/:id',
        loadComponent: () =>
          import('./screens/gestion-noticias/components/crear-noticia/crear-noticia'),
      },
    ],
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
] as Routes;
