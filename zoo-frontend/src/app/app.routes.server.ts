import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'admin',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'vet',
    renderMode: RenderMode.Client,
  },
  {
    path: 'vet/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'cuidador',
    renderMode: RenderMode.Client,
  },
  {
    path: 'cuidador/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'osi',
    renderMode: RenderMode.Client,
  },
  {
    path: 'osi/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'ajustes',
    renderMode: RenderMode.Client,
  },
  {
    path: 'ajustes/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'perfil',
    renderMode: RenderMode.Client,
  },
  {
    path: 'perfil/**',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
