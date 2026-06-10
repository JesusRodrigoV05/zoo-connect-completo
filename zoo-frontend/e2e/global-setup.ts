import { execSync } from "node:child_process";

export default async function globalSetup() {
  const sql = `
    INSERT INTO tipo_producto (id_tipo_producto, nombre_tipo_producto, descripcion_tipo_producto, is_active)
    VALUES (4, 'Medicamento', 'Productos medicos veterinarios', true)
    ON CONFLICT (id_tipo_producto) DO NOTHING;

    INSERT INTO productos (
      nombre_producto,
      descripcion_producto,
      stock_actual,
      stock_minimo,
      is_active,
      tipo_producto_id,
      unidad_medida_id
    )
    VALUES (
      'Antibiotico E2E',
      'Medicamento de prueba para tests E2E',
      100,
      10,
      true,
      4,
      1
    )
    ON CONFLICT (nombre_producto) DO UPDATE SET tipo_producto_id = 4;

    INSERT INTO tipo_examen (nombre_tipo_examen, descripcion, is_active)
    VALUES ('Radiografia E2E', 'Examen de imagen para pruebas E2E', true)
    ON CONFLICT (nombre_tipo_examen) DO NOTHING;
  `;

  try {
    execSync(
      `docker exec zoo-postgres psql -U postgres -d ZOOCONNECT -c "${sql.replace(/\n/g, " ")}"`,
      { stdio: "inherit" },
    );
  } catch (error) {
    console.warn("No se pudo ejecutar el seed E2E en PostgreSQL:", error);
  }
}
