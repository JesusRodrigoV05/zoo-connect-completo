export interface Especie {
  idEspecie: number;
  nombreCientifico: string;
  nombreComun: string;
  filo: string;
  clase: string;
  orden: string;
  familia: string;
  descripcion: string;
  isActive: boolean;
}

export type CreateEspecie = Omit<Especie, "idEspecie">;

export type UpdateEspecie = Partial<CreateEspecie> & { idEspecie: number };
