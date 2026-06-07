import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { UsuarioAdapter, UsuarioBackendResponse } from "@app/core/adapters/usuario/usuario.adapter";
import { Usuario, RolId } from "@app/core/models/usuario/usuario.model";
import { AdminUsuarios, UserFilters } from "@app/features/private/admin/services/admin-usuarios";
import { environment } from "@env";

describe("Pruebas unitarias — Luz Ticona", () => {

  it("UsuarioAdapter.fromBackend mapea todos los campos correctamente", () => {
    // 1) Preparación
    const backend: UsuarioBackendResponse = {
      id: 1,
      email: "luz@zoo.com",
      username: "luzticona",
      photo_url: "https://foto.com/luz.jpg",
      is_active: true,
      role_id: RolId.ADMIN,
      created_at: "2024-01-15T10:00:00Z",
    };

    // 2) Lógica
    const result = UsuarioAdapter.fromBackend(backend);

    // 3) Assert
    expect(result.id).toBe("1");
    expect(result.email).toBe("luz@zoo.com");
    expect(result.username).toBe("luzticona");
    expect(result.fotoUrl).toBe("https://foto.com/luz.jpg");
    expect(result.activo).toBe(true);
    expect(result.rol.id).toBe(RolId.ADMIN);
    expect(result.rol.nombre).toBe("Administrador");
    expect(result.creadoEn).toBe("2024-01-15T10:00:00Z");
  });

  it("UsuarioAdapter.toCreateRequest transforma correctamente para crear usuario", () => {
    // 1) Preparación
    const usuario: Omit<Usuario, "id" | "creadoEn" | "activo"> & { password: string } = {
      email: "  test@zoo.com  ",
      username: "  testuser  ",
      fotoUrl: "",
      rol: { id: RolId.VISITANTE, nombre: "Visitante" },
      password: "  secret123  ",
    };

    // 2) Lógica
    const result = UsuarioAdapter.toCreateRequest(usuario);

    // 3) Assert
    expect(result.email).toBe("test@zoo.com");
    expect(result.username).toBe("testuser");
    expect(result.password).toBe("secret123");
    expect(result.role_id).toBe(RolId.VISITANTE);
  });

  it("AdminUsuarios.getUsers obtiene y mapea lista de usuarios correctamente", () => {
    // 1) Preparación
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminUsuarios],
    });
    const service = TestBed.inject(AdminUsuarios);
    const httpMock = TestBed.inject(HttpTestingController);
    const mockResponse = {
      items: [
        {
          id: 1,
          email: "admin@zoo.com",
          username: "admin",
          photo_url: null,
          is_active: true,
          role_id: RolId.ADMIN,
          created_at: "2024-01-01T00:00:00Z",
        },
        {
          id: 2,
          email: "user@zoo.com",
          username: "user",
          photo_url: "",
          is_active: true,
          role_id: RolId.VISITANTE,
          created_at: "2024-01-02T00:00:00Z",
        },
      ],
      total: 2,
      page: 1,
      size: 10,
      totalPages: 1,
    };

    // 2) Lógica
    let captured: any;
    service.getUsers(1, 10).subscribe((r) => { captured = r; });
    const req = httpMock.expectOne((r) => r.url.includes("/admin_users/users"));
    req.flush(mockResponse);
    httpMock.verify();

    // 3) Assert
    expect(captured.items.length).toBe(2);
    expect(captured.items[0].username).toBe("admin");
    expect(captured.items[0].rol.nombre).toBe("Administrador");
    expect(captured.items[1].username).toBe("user");
    expect(captured.items[1].rol.nombre).toBe("Visitante");
  });

  it("AdminUsuarios.createUser maneja error 400 (email ya registrado)", () => {
    // 1) Preparación
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminUsuarios],
    });
    const service = TestBed.inject(AdminUsuarios);
    const httpMock = TestBed.inject(HttpTestingController);
    
    const newUser = {
      email: "existente@zoo.com",
      username: "existente",
      fotoUrl: "",
      rol: { id: RolId.VISITANTE, nombre: "Visitante" },
      password: "123456",
    };

    // 2) Lógica
    let capturedError: any;
    service.createUser(newUser).subscribe({
      error: (err) => { capturedError = err; },
    });
    const req = httpMock.expectOne(service["usuariosUrl"]);
    req.flush("Email already exists", { status: 400, statusText: "Bad Request" });
    httpMock.verify();

    // 3) Assert
    expect(capturedError.message).toBe("El email ya está registrado");
  });

  it("AdminUsuarios.updateUser maneja error 404 (usuario no encontrado)", () => {
    // 1) Preparación
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminUsuarios],
    });
    const service = TestBed.inject(AdminUsuarios);
    const httpMock = TestBed.inject(HttpTestingController);
    
    const updateData = { username: "nuevoNombre" };

    // 2) Lógica
    let capturedError: any;
    service.updateUser(999, updateData).subscribe({
      error: (err) => { capturedError = err; },
    });
    const req = httpMock.expectOne(`${service["usuariosUrl"]}/999`);
    req.flush("User not found", { status: 404, statusText: "Not Found" });
    httpMock.verify();

    // 3) Assert
    expect(capturedError.message).toBe("Usuario no encontrado");
  });

});