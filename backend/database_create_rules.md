# Guía de Configuración de Base de Datos

## Backend - Plataforma Educativa de Agentes Múltiples

**Versión:** 1.0.0  
**Sistema de Base de Datos:** PostgreSQL 14+  
**Framework ORM:** SQLAlchemy 2.0.25

---

## Prerequisitos

Antes de configurar la base de datos, asegúrate de tener instalado lo siguiente:

- Python 3.10 o superior
- PostgreSQL 14 o superior
- pip (gestor de paquetes de Python)

---

## 1. Instalar Dependencias de Python

Navega al directorio backend e instala los paquetes requeridos:

```bash
cd backend
pip install -r requirements.txt
```

**Paquetes instalados incluyen:**

- SQLAlchemy 2.0.25 (ORM)
- psycopg2-binary 2.9.9 (adaptador PostgreSQL)
- Alembic 1.13.1 (migraciones de base de datos)
- Pydantic 2.5.3 (validación de datos)
- FastAPI 0.109.0 (framework web)

---

## 2. Configuración de PostgreSQL

### 2.1. Instalar PostgreSQL

Descarga e instala PostgreSQL desde el sitio web oficial:

**Windows/macOS/Linux:**  
https://www.postgresql.org/download/

Después de la instalación, verifica que esté funcionando:

```bash
psql --version
# Salida esperada: psql (PostgreSQL) 14.x
```

### 2.2. Opciones de Creación de Base de Datos

Tienes dos opciones para crear la base de datos:

#### Opción A: Usando Script SQL (Recomendado para principiantes)

Usa el script proporcionado `create_database.sql` que automáticamente crea todas las tablas, índices, restricciones y datos iniciales.

**Qué hace `create_database.sql`:**

- Crea la base de datos `agentes_db`
- Habilita la extensión UUID (uuid-ossp)
- Crea las 14 tablas con sus relaciones apropiadas
- Añade índices para optimización de rendimiento
- Inserta roles predeterminados (student, teacher, admin)
- Inserta 5 logros de ejemplo
- Configura triggers para actualización automática de timestamps
- Añade restricciones CHECK para validación de datos

**Ejecutar en pgAdmin o psql:**

```bash
# Usando línea de comandos psql
psql -U postgres -f create_database.sql

# O abrir pgAdmin 4:
# 1. Clic derecho en el servidor "PostgreSQL"
# 2. Seleccionar "Query Tool"
# 3. Abrir create_database.sql
# 4. Ejecutar (F5)
```

#### Opción B: Creación Manual (Para configuraciones personalizadas)

```sql
-- Conectar a PostgreSQL
psql -U postgres

-- Crear base de datos
CREATE DATABASE agentes_db;

-- Crear usuario (opcional)
CREATE USER agentes_user WITH PASSWORD 'tu_contraseña_segura';
GRANT ALL PRIVILEGES ON DATABASE agentes_db TO agentes_user;
```

---

## 3. Configuración del Entorno

Crea un archivo `.env` en el directorio `backend/` con la siguiente configuración:

```env
# Conexión a Base de Datos
DATABASE_URL=postgresql://postgres:tu_contraseña@localhost:5432/agentes_db

# Autenticación JWT
SECRET_KEY=tu-clave-secreta-aqui-cambiar-en-produccion
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Caché Redis
REDIS_URL=redis://localhost:6379/0

# Configuración CORS
BACKEND_CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
```

**Importante:**

- Reemplaza `tu_contraseña` con tu contraseña real de PostgreSQL
- Genera una `SECRET_KEY` segura usando:
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```

---

## 4. Inicialización de la Base de Datos

### Método 1: Script Automatizado (Recomendado)

Este método usa SQLAlchemy ORM para crear tablas e insertar datos iniciales.

**Ejecuta el script de inicialización:**

```bash
cd backend
python -m app.db.init_db
```

**Qué hace este script:**

- Crea las 14 tablas usando modelos de SQLAlchemy
- Inserta 3 roles predeterminados (student, teacher, admin)
- Inserta 5 logros de ejemplo
- Valida todas las relaciones y restricciones
- Proporciona retroalimentación sobre la inicialización exitosa

**Salida esperada:**

```
Inicializando base de datos...
✓ Tablas creadas exitosamente
✓ Roles insertados: student, teacher, admin
✓ Logros insertados: 5 en total
✓ Inicialización de base de datos completada!
```

### Método 2: Migraciones de Base de Datos con Alembic

Para entornos de producción o cambios de esquema con control de versiones:

```bash
cd backend

# Inicializar configuración de Alembic
alembic init alembic

# Generar migración inicial desde modelos
alembic revision --autogenerate -m "Esquema inicial de base de datos"

# Aplicar migraciones a la base de datos
alembic upgrade head
```

**Beneficios de Alembic:**

- Control de versiones para el esquema de base de datos
- Capacidad de rollback (`alembic downgrade -1`)
- Colaboración en equipo sobre cambios de esquema
- Despliegues seguros en producción

---

## 5. Resumen del Esquema de Base de Datos

La base de datos consiste de 14 tablas organizadas en 4 módulos funcionales:

### Módulo 1: Autenticación (3 tablas)

| Tabla           | Propósito                                                    |
| --------------- | ------------------------------------------------------------ |
| `roles`         | Definiciones de roles con permisos (student, teacher, admin) |
| `users`         | Usuarios registrados de la plataforma con credenciales       |
| `user_sessions` | Seguimiento de sesiones JWT activas                          |

### Módulo 2: Proyectos (4 tablas)

| Tabla                   | Propósito                                           |
| ----------------------- | --------------------------------------------------- |
| `projects`              | Proyectos de simulación creados por usuarios        |
| `project_versions`      | Historial de control de versiones tipo Git          |
| `shared_projects`       | Enlaces de compartir públicos con control de acceso |
| `project_collaborators` | Permisos de colaboración multiusuario               |

### Módulo 3: Tutoriales (4 tablas)

| Tabla               | Propósito                                        |
| ------------------- | ------------------------------------------------ |
| `tutorials`         | Módulos de aprendizaje interactivos (8 niveles)  |
| `user_progress`     | Seguimiento de progreso individual en tutoriales |
| `achievements`      | Definiciones de logros para gamificación         |
| `user_achievements` | Desbloqueos de logros de usuario                 |

### Módulo 4: Métricas (3 tablas)

| Tabla                | Propósito                                          |
| -------------------- | -------------------------------------------------- |
| `simulation_metrics` | Estadísticas globales de ejecución de simulaciones |
| `agent_metrics`      | Datos de rendimiento de agentes individuales       |
| `heatmap_data`       | Matrices de visualización de movimiento espacial   |

**Total:** 14 tablas con integridad relacional completa

Para documentación detallada del esquema, ver `database_schema.md`.

---

## 6. Verificar la Instalación

Crea un script de prueba para verificar la conexión a la base de datos y el esquema:

**Crear `backend/test_db.py`:**

```python
from app.db.session import engine
from app.db.base import Base
from sqlalchemy import inspect, text

def verify_database():
    """Verificar conexión a la base de datos e integridad del esquema."""

    try:
        # Probar conexión
        with engine.connect() as connection:
            print("✓ Conexión a base de datos exitosa")

            # Listar todas las tablas
            inspector = inspect(engine)
            tables = inspector.get_table_names()

            print(f"\n✓ Tablas creadas: {len(tables)}")
            for table in sorted(tables):
                print(f"  • {table}")

            # Verificar datos iniciales
            result = connection.execute(text("SELECT COUNT(*) FROM roles"))
            role_count = result.scalar()
            print(f"\n✓ Datos iniciales cargados:")
            print(f"  • Roles: {role_count}")

            result = connection.execute(text("SELECT COUNT(*) FROM achievements"))
            achievement_count = result.scalar()
            print(f"  • Logros: {achievement_count}")

            print("\n✓ Verificación de base de datos completada!")
            return True

    except Exception as e:
        print(f"\n✗ Verificación de base de datos fallida: {e}")
        return False

if __name__ == "__main__":
    verify_database()
```

**Ejecutar la verificación:**

```bash
cd backend
python test_db.py
```

**Salida esperada:**

```
✓ Conexión a base de datos exitosa
✓ Tablas creadas: 14
  • achievements
  • agent_metrics
  • heatmap_data
  • project_collaborators
  • project_versions
  • projects
  • roles
  • shared_projects
  • simulation_metrics
  • tutorials
  • user_achievements
  • user_progress
  • user_sessions
  • users
✓ Datos iniciales cargados:
  • Roles: 3
  • Logros: 5
✓ Verificación de base de datos completada!
```

---

## 7. Consultas SQL Útiles

### Verificar roles predeterminados

```sql
SELECT id, name, description
FROM roles
ORDER BY id;
```

### Ver estructura de tabla

```sql
-- Específico de PostgreSQL
\d projects

-- SQL estándar
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'projects';
```

### Contar registros por tabla

```sql
SELECT
    schemaname,
    tablename,
    n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

### Verificar tamaño de base de datos

```sql
SELECT
    pg_size_pretty(pg_database_size('agentes_db')) as database_size;
```

---

## 8. Próximos Pasos

Después de una configuración exitosa de la base de datos:

1. **Iniciar el servidor FastAPI**

   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Probar endpoints de autenticación**

   - POST `/api/v1/auth/register` - Crear usuario de prueba
   - POST `/api/v1/auth/login` - Obtener token JWT

3. **Explorar documentación de la API**

   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

4. **Conectar frontend**
   - Actualizar URL base de la API del frontend a http://localhost:8000

---

## 9. Solución de Problemas

### Error: "relation does not exist"

**Causa:** Las tablas no han sido creadas.

**Solución:**

```bash
cd backend
python -m app.db.init_db
```

### Error: "could not connect to server"

**Causa:** El servicio de PostgreSQL no está ejecutándose.

**Solución:**

```bash
# Windows
net start postgresql-x64-14

# macOS (Homebrew)
brew services start postgresql@14

# Linux (systemd)
sudo systemctl start postgresql

# Verificar estado
pg_isready
```

### Error: "password authentication failed"

**Causa:** Credenciales incorrectas de base de datos en el archivo `.env`.

**Solución:**

```bash
# Verificar contraseña actual
psql -U postgres -d agentes_db

# Resetear contraseña si es necesario
psql -U postgres
ALTER USER postgres PASSWORD 'nueva_contraseña';
\q

# Actualizar archivo .env con la contraseña correcta
```

### Error: "database already exists"

**Causa:** Intentando recrear una base de datos existente.

**Solución:**

```bash
# Eliminar y recrear base de datos
psql -U postgres
DROP DATABASE IF EXISTS agentes_db;
CREATE DATABASE agentes_db;
\q

# Re-ejecutar inicialización
python -m app.db.init_db
```

### Error: "FATAL: role does not exist"

**Causa:** El usuario de la base de datos no existe.

**Solución:**

```bash
psql -U postgres
CREATE USER agentes_user WITH PASSWORD 'tu_contraseña';
GRANT ALL PRIVILEGES ON DATABASE agentes_db TO agentes_user;
\q
```

---

## 10. Recursos Adicionales

### Documentación

- [Documentación de SQLAlchemy 2.0](https://docs.sqlalchemy.org/en/20/)
- [Documentación Oficial de PostgreSQL](https://www.postgresql.org/docs/)
- [Guía de Migraciones de Alembic](https://alembic.sqlalchemy.org/en/latest/tutorial.html)
- [Guía de Base de Datos de FastAPI](https://fastapi.tiangolo.com/tutorial/sql-databases/)

### Herramientas de Gestión de Base de Datos

- **pgAdmin 4** - GUI para gestión de PostgreSQL
- **DBeaver** - Herramienta universal de base de datos
- **DataGrip** - IDE de base de datos de JetBrains
- **TablePlus** - Cliente moderno de base de datos

### Diagrama de Esquema

Para un diagrama completo de entidad-relación y descripciones detalladas de campos, consulta:

- `database_schema.md` - Documentación completa del esquema
- `create_database.sql` - Esquema SQL completo con comentarios

---

**¡Configuración Completada!** Tu base de datos está lista para desarrollo.
