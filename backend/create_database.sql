-- ================================================================
-- PLATAFORMA EDUCATIVA MULTI-AGENTE
-- Script de Creación de Tablas para PostgreSQL
-- Ejecutar en pgAdmin 4 dentro de la base de datos 'agentes_db'
-- ================================================================

-- NOTA: Este script debe ejecutarse dentro de la base de datos 'agentes_db'
-- En pgAdmin: Click derecho en 'agentes_db' → Query Tool → Pegar este script

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 2. MÓDULO 1: AUTENTICACIÓN (3 tablas)
-- ================================================================

-- Tabla: roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_roles_name ON roles(name);

-- Tabla: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    
    -- Perfil
    full_name VARCHAR(100),
    avatar_url VARCHAR(500),
    bio TEXT,
    
    -- Rol y estado
    role_id INTEGER NOT NULL DEFAULT 1 REFERENCES roles(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    
    -- Contadores
    total_projects INTEGER NOT NULL DEFAULT 0,
    total_likes_received INTEGER NOT NULL DEFAULT 0,
    total_followers INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    last_login_at TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Tabla: user_sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- JWT tokens
    token_jti VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(500),
    
    -- Metadata
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Estado
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at TIMESTAMP NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    last_activity_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_token_jti ON user_sessions(token_jti);
CREATE INDEX idx_sessions_expires_at ON user_sessions(expires_at);

-- ================================================================
-- 3. MÓDULO 2: PROYECTOS (4 tablas)
-- ================================================================

-- Tabla: projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Información básica
    title VARCHAR(200) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    
    -- Visibilidad
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    is_template BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Fork
    fork_from_id UUID REFERENCES projects(id),
    
    -- Configuración Grid
    grid_width INTEGER NOT NULL DEFAULT 25,
    grid_height INTEGER NOT NULL DEFAULT 25,
    cell_size INTEGER NOT NULL DEFAULT 20,
    
    -- Código
    user_code TEXT,
    code_language VARCHAR(20) NOT NULL DEFAULT 'python',
    
    -- Estado del mundo
    world_state JSONB,
    simulation_config JSONB,
    
    -- Dificultad
    difficulty VARCHAR(20),
    
    -- Estadísticas
    views_count INTEGER NOT NULL DEFAULT 0,
    likes_count INTEGER NOT NULL DEFAULT 0,
    forks_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    
    -- Metadata
    version_count INTEGER NOT NULL DEFAULT 1,
    last_opened_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_grid_width CHECK (grid_width >= 5 AND grid_width <= 50),
    CONSTRAINT check_grid_height CHECK (grid_height >= 5 AND grid_height <= 50),
    CONSTRAINT check_cell_size CHECK (cell_size >= 10 AND cell_size <= 50),
    CONSTRAINT check_difficulty CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert') OR difficulty IS NULL)
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_is_public ON projects(is_public);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_projects_likes_count ON projects(likes_count);
CREATE INDEX idx_projects_fork_from_id ON projects(fork_from_id);
CREATE INDEX idx_projects_public_popular ON projects(is_public, likes_count DESC, created_at DESC) WHERE deleted_at IS NULL;

-- Tabla: project_versions
CREATE TABLE project_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    
    commit_message VARCHAR(500),
    user_code TEXT NOT NULL,
    world_state JSONB NOT NULL,
    simulation_config JSONB,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    file_size_bytes INTEGER,
    
    CONSTRAINT unique_project_version UNIQUE(project_id, version_number)
);

CREATE INDEX idx_versions_project_id ON project_versions(project_id);
CREATE INDEX idx_versions_created_at ON project_versions(created_at);

-- Tabla: shared_projects
CREATE TABLE shared_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    share_token VARCHAR(64) UNIQUE NOT NULL,
    share_type VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255),
    
    expires_at TIMESTAMP,
    max_views INTEGER,
    current_views INTEGER NOT NULL DEFAULT 0,
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    last_accessed_at TIMESTAMP,
    
    CONSTRAINT check_share_type CHECK (share_type IN ('view', 'edit', 'embed'))
);

CREATE INDEX idx_shared_token ON shared_projects(share_token);
CREATE INDEX idx_shared_project_id ON shared_projects(project_id);

-- Tabla: project_collaborators
CREATE TABLE project_collaborators (
    id SERIAL PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    permission_level VARCHAR(20) NOT NULL,
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMP DEFAULT NOW() NOT NULL,
    accepted_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    
    CONSTRAINT unique_collaborator UNIQUE(project_id, user_id),
    CONSTRAINT check_permission_level CHECK (permission_level IN ('viewer', 'editor', 'admin')),
    CONSTRAINT check_status CHECK (status IN ('pending', 'active', 'revoked'))
);

CREATE INDEX idx_collaborators_project_id ON project_collaborators(project_id);
CREATE INDEX idx_collaborators_user_id ON project_collaborators(user_id);

-- ================================================================
-- 4. MÓDULO 3: TUTORIALES (2 tablas simplificadas)
-- ================================================================

-- Tabla: tutorials
CREATE TABLE tutorials (
    id SERIAL PRIMARY KEY,
    level INTEGER UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT check_tutorial_level CHECK (level >= 1 AND level <= 20)
);

CREATE INDEX idx_tutorials_level ON tutorials(level);
CREATE INDEX idx_tutorials_slug ON tutorials(slug);
CREATE INDEX idx_tutorials_is_active ON tutorials(is_active);

-- Tabla: user_progress
CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tutorial_id INTEGER NOT NULL REFERENCES tutorials(id) ON DELETE CASCADE,
    
    status VARCHAR(20) NOT NULL DEFAULT 'not_started',
    current_code TEXT,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    
    started_at TIMESTAMP DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    
    CONSTRAINT unique_user_progress UNIQUE(user_id, tutorial_id),
    CONSTRAINT check_progress_status CHECK (status IN ('not_started', 'in_progress', 'completed'))
);

CREATE INDEX idx_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_progress_tutorial_id ON user_progress(tutorial_id);
CREATE INDEX idx_progress_status ON user_progress(status);

-- ================================================================
-- 5. MÓDULO 4: MÉTRICAS (3 tablas)
-- ================================================================

-- Tabla: simulation_metrics
CREATE TABLE simulation_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tutorial_id INTEGER REFERENCES tutorials(id) ON DELETE SET NULL,
    
    -- Duración
    simulation_duration_ms INTEGER,
    total_steps INTEGER NOT NULL,
    final_step_reached INTEGER NOT NULL,
    
    -- Métricas globales
    total_agents INTEGER NOT NULL,
    agents_survived INTEGER NOT NULL,
    total_food_collected INTEGER NOT NULL DEFAULT 0,
    total_energy_consumed INTEGER NOT NULL DEFAULT 0,
    total_collisions INTEGER NOT NULL DEFAULT 0,
    
    -- Eficiencia
    grid_coverage_percent NUMERIC(5,2),
    efficiency_score NUMERIC(5,2),
    
    success BOOLEAN NOT NULL,
    
    started_at TIMESTAMP NOT NULL,
    finished_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_metrics_project_id ON simulation_metrics(project_id);
CREATE INDEX idx_metrics_user_id ON simulation_metrics(user_id);
CREATE INDEX idx_metrics_tutorial_id ON simulation_metrics(tutorial_id);
CREATE INDEX idx_metrics_created_at ON simulation_metrics(created_at);

-- Tabla: agent_metrics
CREATE TABLE agent_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    simulation_metrics_id UUID NOT NULL REFERENCES simulation_metrics(id) ON DELETE CASCADE,
    
    agent_id VARCHAR(100) NOT NULL,
    agent_type VARCHAR(50) NOT NULL,
    
    -- Estadísticas
    steps_alive INTEGER NOT NULL,
    distance_traveled INTEGER NOT NULL DEFAULT 0,
    food_collected INTEGER NOT NULL DEFAULT 0,
    energy_consumed INTEGER NOT NULL DEFAULT 0,
    energy_at_end INTEGER NOT NULL DEFAULT 0,
    collisions_count INTEGER NOT NULL DEFAULT 0,
    cells_visited INTEGER NOT NULL DEFAULT 0,
    
    -- Datos para gráficos
    path_data JSONB,
    energy_over_time JSONB,
    
    -- Resultado
    died_at_step INTEGER,
    death_reason VARCHAR(50),
    success BOOLEAN NOT NULL,
    
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_agent_metrics_simulation_id ON agent_metrics(simulation_metrics_id);
CREATE INDEX idx_agent_metrics_agent_type ON agent_metrics(agent_type);

-- Tabla: heatmap_data
CREATE TABLE heatmap_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    simulation_metrics_id UUID UNIQUE NOT NULL REFERENCES simulation_metrics(id) ON DELETE CASCADE,
    
    grid_width INTEGER NOT NULL,
    grid_height INTEGER NOT NULL,
    
    visit_matrix JSONB NOT NULL,
    max_visits INTEGER NOT NULL,
    hotspots JSONB,
    
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_heatmap_simulation_id ON heatmap_data(simulation_metrics_id);

-- ================================================================
-- 6. TRIGGERS Y FUNCIONES
-- ================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas con updated_at
CREATE TRIGGER update_users_modtime 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_roles_modtime 
    BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_projects_modtime 
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_tutorials_modtime 
    BEFORE UPDATE ON tutorials
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_user_progress_modtime 
    BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Función para actualizar forks_count cuando se crea un fork
CREATE OR REPLACE FUNCTION update_forks_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.fork_from_id IS NOT NULL THEN
        UPDATE projects 
        SET forks_count = forks_count + 1 
        WHERE id = NEW.fork_from_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_forks
    AFTER INSERT ON projects
    FOR EACH ROW EXECUTE FUNCTION update_forks_count();

-- ================================================================
-- 7. DATOS INICIALES
-- ================================================================

-- Insertar roles
INSERT INTO roles (id, name, description, permissions) VALUES
(1, 'student', 'Estudiante con acceso básico', 
 '{"can_create_projects": true, "can_delete_own_projects": true, "max_projects": 100, "can_view_public_projects": true}'::jsonb),
(2, 'teacher', 'Profesor con permisos para crear tutoriales',
 '{"can_create_projects": true, "can_create_tutorials": true, "can_view_student_stats": true, "can_moderate_comments": true, "max_projects": 500}'::jsonb),
(3, 'admin', 'Administrador con control total',
 '{"can_do_everything": true}'::jsonb);

-- ================================================================
-- 8. VERIFICACIÓN
-- ================================================================

-- Listar todas las tablas creadas
SELECT 
    schemaname, 
    tablename, 
    tableowner 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Contar registros iniciales
SELECT 'roles' as table_name, COUNT(*) as count FROM roles;

-- ================================================================
-- FIN DEL SCRIPT
-- ================================================================

-- Resumen:
-- ✅ 12 tablas creadas
-- ✅ 3 roles insertados (student, teacher, admin)
-- ✅ Índices para performance
-- ✅ Constraints de validación
-- ✅ Triggers automáticos
-- ✅ Base de datos lista para usar

COMMENT ON DATABASE agentes_db IS 'Base de datos para Plataforma Educativa Multi-Agente';
