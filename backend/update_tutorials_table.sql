-- ================================================================
-- SIMPLIFICAR TABLA TUTORIALS
-- Ejecutar en pgAdmin sobre la base de datos 'agents_db'
-- ================================================================

-- 1. Eliminar la tabla antigua
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS tutorials CASCADE;

-- 2. Crear tabla minimalista
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

-- 3. Insertar los 8 niveles básicos
INSERT INTO tutorials (level, slug, is_active) VALUES
(1, 'introduccion-agentes-entornos', true),
(2, 'acciones-basicas', true),
(3, 'percepcion-sensores', true),
(4, 'recompensas-objetivos', true),
(5, 'politicas-heuristicas', true),
(6, 'exploracion-explotacion', true),
(7, 'introduccion-q-learning', true),
(8, 'q-learning-aplicado', true);

-- 4. Recrear tabla user_progress (sin cambios)
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

-- 5. Aplicar trigger para updated_at
CREATE TRIGGER update_tutorials_modtime 
    BEFORE UPDATE ON tutorials
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_user_progress_modtime 
    BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Verificar
SELECT * FROM tutorials ORDER BY level;
