-- Habilitar la extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tablas base
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(100) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'profesor', 'alumno', 'auxiliar')),
    dni VARCHAR(20) UNIQUE,
    telefono VARCHAR(20),
    direccion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP,
    especialidad VARCHAR(100),
    grado VARCHAR(50),
    seccion VARCHAR(10),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS grados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(50) NOT NULL,
    nivel VARCHAR(20) NOT NULL CHECK (nivel IN ('inicial', 'primaria', 'secundaria')),
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS secciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(10) NOT NULL,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS cursos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    nivel VARCHAR(20) CHECK (nivel IN ('inicial', 'primaria', 'secundaria')),
    activo BOOLEAN DEFAULT TRUE
);

-- 2. Grupos y relaciones
CREATE TABLE IF NOT EXISTS grupos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    curso_id UUID NOT NULL REFERENCES cursos(id),
    grado_id UUID NOT NULL REFERENCES grados(id),
    seccion_id UUID NOT NULL REFERENCES secciones(id),
    año_escolar VARCHAR(10) NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS grupo_profesor (
    id SERIAL PRIMARY KEY,
    grupo_id UUID NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
    profesor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(grupo_id, profesor_id)
);

CREATE TABLE IF NOT EXISTS grupo_alumno (
    id SERIAL PRIMARY KEY,
    grupo_id UUID NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
    alumno_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(grupo_id, alumno_id)
);

-- 3. Horarios
CREATE TABLE IF NOT EXISTS horarios (
    id SERIAL PRIMARY KEY,
    grupo_id UUID NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
    dia VARCHAR(20) NOT NULL CHECK (dia IN ('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')),
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    aula VARCHAR(50),
    CONSTRAINT hora_valida CHECK (hora_fin > hora_inicio)
);

-- 4. Evaluaciones
CREATE TABLE IF NOT EXISTS evaluaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grupo_id UUID NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_limite TIMESTAMP WITH TIME ZONE,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completada')),
    tipo VARCHAR(50) NOT NULL
);

-- 5. Calificaciones y asistencia
CREATE TABLE IF NOT EXISTS calificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alumno_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    grupo_id UUID NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
    curso_id UUID NOT NULL REFERENCES cursos(id),
    evaluacion_id UUID REFERENCES evaluaciones(id),
    tipo VARCHAR(50) NOT NULL,
    descripcion TEXT,
    nota NUMERIC(5,2) NOT NULL,
    ponderacion NUMERIC(5,2) DEFAULT 1.00,
    comentario TEXT,
    fecha DATE NOT NULL,
    periodo VARCHAR(50),
    registrado_por UUID REFERENCES usuarios(id),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP,
    UNIQUE(alumno_id, grupo_id, tipo, periodo, evaluacion_id)
);

CREATE TABLE IF NOT EXISTS asistencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estudiante_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    grupo_id UUID REFERENCES grupos(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('presente', 'ausente', 'tardanza', 'justificado')),
    hora_entrada TIME,
    hora_salida TIME,
    observacion TEXT,
    registrado_por UUID REFERENCES usuarios(id),
    UNIQUE(estudiante_id, grupo_id, fecha)
);

CREATE TABLE IF NOT EXISTS asistencias_profesores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profesor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('presente', 'ausente', 'tardanza', 'justificado')),
    hora_entrada TIME,
    hora_salida TIME,
    observacion TEXT,
    registrado_por UUID REFERENCES usuarios(id),
    UNIQUE(profesor_id, fecha)
);

CREATE TABLE IF NOT EXISTS asistencias_general (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('alumno', 'profesor')),
    grupo_id UUID REFERENCES grupos(id) ON DELETE SET NULL,
    fecha DATE NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('presente', 'ausente', 'tardanza', 'justificado')),
    hora_entrada TIME,
    hora_salida TIME,
    observacion TEXT,
    registrado_por UUID REFERENCES usuarios(id),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, fecha)
);

-- 6. Tareas y entregas
CREATE TABLE IF NOT EXISTS tareas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grupo_id UUID REFERENCES grupos(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega TIMESTAMP NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completada', 'calificada')),
    creado_por UUID REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS entregas_tareas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tarea_id UUID REFERENCES tareas(id) ON DELETE CASCADE,
    alumno_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_entrega TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    contenido TEXT,
    archivo_url TEXT,
    calificacion NUMERIC(5,2),
    comentario TEXT,
    UNIQUE(tarea_id, alumno_id)
);

-- 7. Registro de tokens
CREATE TABLE IF NOT EXISTS registro_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token VARCHAR(100) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'profesor', 'alumno', 'auxiliar')),
    creado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    usado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_uso TIMESTAMP,
    usuario_asociado UUID REFERENCES usuarios(id)
);

-- 8. Comunicación
CREATE TABLE IF NOT EXISTS mensajes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    remitente_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    destinatario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    asunto VARCHAR(200) NOT NULL,
    contenido TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    leido BOOLEAN DEFAULT FALSE,
    carpeta VARCHAR(20) DEFAULT 'recibidos' CHECK (carpeta IN ('recibidos', 'enviados', 'borradores', 'papelera'))
);

CREATE TABLE IF NOT EXISTS anuncios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(100) NOT NULL,
    contenido TEXT NOT NULL,
    autor_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    publico BOOLEAN DEFAULT false
);

-- 9. Eventos y salas virtuales
CREATE TABLE IF NOT EXISTS eventos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    lugar VARCHAR(200),
    tipo VARCHAR(50),
    publico BOOLEAN DEFAULT TRUE,
    creado_por UUID REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS salas_virtuales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grupo_id UUID REFERENCES grupos(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    enlace TEXT NOT NULL,
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    creado_por UUID REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Actividades y logros
CREATE TABLE IF NOT EXISTS actividades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logros_alumno (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alumno_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    otorgado_por UUID REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS actividades_auxiliar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auxiliar_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    accion VARCHAR(200) NOT NULL,
    detalles TEXT,
    tipo VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tareas_auxiliar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auxiliar_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En progreso', 'Completado')),
    fecha_limite TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. QR para asistencia
CREATE TABLE IF NOT EXISTS qr_asistencias_curso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
    qr_codigo TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- 12. Índices para rendimiento
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_grupos_profesor ON grupos(profesor_id);
CREATE INDEX idx_asistencias_fecha ON asistencias(fecha);
CREATE INDEX idx_asistencias_estudiante ON asistencias(estudiante_id);
CREATE INDEX idx_calificaciones_alumno ON calificaciones(alumno_id);
CREATE INDEX idx_tareas_grupo ON tareas(grupo_id);
CREATE INDEX idx_mensajes_remitente ON mensajes(remitente_id);
CREATE INDEX idx_mensajes_destinatario ON mensajes(destinatario_id);
CREATE INDEX idx_anuncios_publico ON anuncios(publico);
CREATE INDEX idx_eventos_fecha ON eventos(fecha_inicio);
CREATE INDEX idx_salas_virtuales_grupo ON salas_virtuales(grupo_id);
