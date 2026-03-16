export enum RolId {
    ADMIN = 1,
    VISITANTE = 2,
    CUIDADOR = 3,  
    VETERINARIO = 4,
}

export interface Rol {
    id: RolId,
    nombre: string,
}

export interface Usuario {
    id: string,
    email: string, 
    username: string,
    fotoUrl: string,
    activo: boolean,
    rol: Rol,
    creadoEn: string,
}