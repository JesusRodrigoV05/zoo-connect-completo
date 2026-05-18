export function createBackendAnimal(overrides: Record<string, any> = {}) {
  const defaults = {
    id_animal: 1,
    nombre_animal: 'Simba',
    genero: true,
    fecha_nacimiento: '2018-03-15',
    fecha_ingreso: '2020-01-10',
    procedencia_animal: 'Rescate',
    estado_operativo: 'Saludable',
    es_publico: true,
    descripcion: 'Un majestuoso león africano que llegó al refugio siendo cachorro.',
    especie_id: 1,
    habitat_id: 1,
    age: 6,
    especie: {
      id_especie: 1,
      nombre_cientifico: 'Panthera leo',
      nombre_especie: 'León Africano',
      filo: 'Chordata',
      clase: 'Mammalia',
      orden: 'Carnivora',
      familia: 'Felidae',
      descripcion_especie: '',
      is_active: true,
    },
    habitat: {
      id_habitat: 1,
      nombre_habitat: 'Sabana Africana',
      tipo_habitat: 'Sabana',
      descripcion_habitat: 'Amplio espacio abierto con vegetación baja',
      condiciones_climaticas: 'Cálido y seco',
      is_active: true,
    },
    media: [
      {
        id_media_animal: 1,
        tipo_medio: true,
        url_animal: 'https://example.com/simba.jpg',
        titulo_media_animal: 'Simba el león',
        descripcion_media_animal: '',
        public_id: 'simba-001',
      },
    ],
  };
  return { ...defaults, ...overrides };
}

export function createBackendAnimals(count: number) {
  const names = [
    'Simba', 'Nala', 'Mufasa', 'Scar', 'Timón', 'Pumba',
    'Zazu', 'Rafiki', 'Sarabi', 'Shenzi', 'Banzai', 'Ed',
    'Kiara', 'Kovu', 'Vitani', 'Nuka', 'Zira', 'Mheetu',
    'Taka', 'Mohatu',
  ];
  const species = [
    'León Africano', 'Tigre de Bengala', 'Elefante Africano',
    'Jirafa', 'Cebra', 'Rinoceronte', 'Hipopótamo', 'Gorila',
    'Chimpancé', 'Leopardo', 'Guepardo', 'Licaón',
  ];
  const habitats = [
    { nombre: 'Sabana Africana', tipo: 'Sabana', condiciones: 'Cálido y seco' },
    { nombre: 'Selva Tropical', tipo: 'Selva', condiciones: 'Húmedo y cálido' },
    { nombre: 'Montaña Andina', tipo: 'Montaña', condiciones: 'Frío y ventoso' },
  ];

  return Array.from({ length: count }, (_, i) =>
    createBackendAnimal({
      id_animal: i + 1,
      nombre_animal: names[i % names.length],
      genero: i % 2 === 0,
      age: 3 + (i % 10),
      estado_operativo:
        i % 5 === 0 ? 'En tratamiento' : 'Saludable',
      especie: {
        id_especie: (i % 12) + 1,
        nombre_cientifico: `Species ${i + 1}`,
        nombre_especie: species[i % species.length],
        filo: 'Chordata',
        clase: 'Mammalia',
        orden: 'Carnivora',
        familia: 'Felidae',
        descripcion_especie: '',
        is_active: true,
      },
      habitat: {
        id_habitat: (i % 3) + 1,
        nombre_habitat: habitats[i % 3].nombre,
        tipo_habitat: habitats[i % 3].tipo,
        descripcion_habitat: `Descripción del ${habitats[i % 3].nombre}`,
        condiciones_climaticas: habitats[i % 3].condiciones,
        is_active: true,
      },
      media: [
        {
          id_media_animal: i + 1,
          tipo_medio: true,
          url_animal: `https://example.com/animal-${i + 1}.jpg`,
          titulo_media_animal: names[i % names.length],
          descripcion_media_animal: '',
          public_id: `animal-${i + 1}`,
        },
      ],
    })
  );
}

export function createPaginatedResponse(
  items: any[],
  page: number,
  total: number,
) {
  return {
    items,
    total,
    page,
    size: 12,
    totalPages: Math.ceil(total / 12),
  };
}
