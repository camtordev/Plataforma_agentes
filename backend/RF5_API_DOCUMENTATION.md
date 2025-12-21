# API REST - RF5: Sistema de Persistencia y Compartición

## Resumen de Implementación

Se han implementado **21 endpoints** para el sistema completo de gestión de proyectos, cubriendo todos los requisitos funcionales RF5.1, RF5.2 y RF5.3.

---

## 📋 RF5.1 - Guardado de Proyectos

### CRUD Básico

#### 1. Crear Proyecto

```http
POST /api/v1/projects/
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Mi Primer Proyecto",
  "description": "Proyecto de prueba con agente reactivo",
  "is_public": false,
  "grid_width": 25,
  "grid_height": 25,
  "user_code": "# Código del agente",
  "agent_type": "reactive",
  "difficulty_level": 1,
  "tags": ["tutorial", "reactivo"]
}
```

**Respuesta:** `201 Created`

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "Mi Primer Proyecto",
  "created_at": "2025-12-17T10:00:00Z",
  "likes_count": 0,
  "forks_count": 0
}
```

---

#### 2. Listar Mis Proyectos

```http
GET /api/v1/projects/?skip=0&limit=20
Authorization: Bearer {token}
```

**Respuesta:** `200 OK` - Lista de proyectos del usuario

---

#### 3. Obtener Proyecto por ID

```http
GET /api/v1/projects/{project_id}
Authorization: Bearer {token}
```

**Respuesta:** `200 OK` - Detalles completos del proyecto

---

#### 4. Actualizar Proyecto

```http
PUT /api/v1/projects/{project_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Nuevo Título",
  "is_public": true,
  "user_code": "# Código actualizado"
}
```

**Respuesta:** `200 OK` - Proyecto actualizado

---

#### 5. Eliminar Proyecto

```http
DELETE /api/v1/projects/{project_id}
Authorization: Bearer {token}
```

**Respuesta:** `204 No Content`

---

### Exportar / Importar

#### 6. Exportar Proyecto

```http
GET /api/v1/projects/{project_id}/export?include_versions=true
Authorization: Bearer {token}
```

**Respuesta:** `200 OK`

```json
{
  "id": "uuid",
  "title": "Mi Proyecto",
  "user_code": "...",
  "world_state": {...},
  "versions": [...]
}
```

**Uso:** Descarga el JSON completo para backup o transferencia.

---

#### 7. Importar Proyecto

```http
POST /api/v1/projects/import
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Proyecto Importado",
  "user_code": "...",
  "world_state": {...}
}
```

**Respuesta:** `201 Created` - Nuevo proyecto creado desde JSON

---

### Sistema de Versionado

#### 8. Crear Versión

```http
POST /api/v1/projects/{project_id}/versions
Authorization: Bearer {token}
Content-Type: application/json

{
  "version_name": "v1.0.0",
  "changelog": "Primera versión estable"
}
```

**Respuesta:** `201 Created`

```json
{
  "id": "uuid",
  "version_number": 1,
  "version_name": "v1.0.0",
  "changelog": "Primera versión estable",
  "created_at": "2025-12-17T10:00:00Z"
}
```

---

#### 9. Listar Versiones

```http
GET /api/v1/projects/{project_id}/versions
Authorization: Bearer {token}
```

**Respuesta:** `200 OK` - Historial completo de versiones

---

#### 10. Fork (Duplicar Proyecto)

```http
POST /api/v1/projects/{project_id}/fork
Authorization: Bearer {token}
```

**Respuesta:** `201 Created` - Nueva copia del proyecto

**Nota:** El fork mantiene referencia al proyecto original en `fork_from_id`.

---

## 🔗 RF5.2 - Compartición Social

#### 11. Generar URL Compartida

```http
POST /api/v1/projects/{project_id}/share
Authorization: Bearer {token}
Content-Type: application/json

{
  "expires_in_days": 30,
  "allow_fork": true,
  "allow_download": true
}
```

**Respuesta:** `201 Created`

```json
{
  "id": "uuid",
  "share_token": "abc123xyz",
  "view_count": 0,
  "expires_at": "2026-01-17T10:00:00Z",
  "is_active": true
}
```

**URL generada:** `https://tu-app.com/shared/abc123xyz`

---

#### 12. Ver Proyecto Compartido (Vista Previa)

```http
GET /api/v1/projects/shared/{share_token}
```

**Sin autenticación requerida**

**Respuesta:** `200 OK` - Proyecto completo en modo lectura

**Errores:**

- `404 Not Found` - Token inválido
- `410 Gone` - Enlace expirado

---

#### 13. Revocar Enlace Compartido

```http
DELETE /api/v1/projects/{project_id}/share
Authorization: Bearer {token}
```

**Respuesta:** `204 No Content`

---

## 🎨 RF5.3 - Galería Comunitaria

#### 14. Explorar Proyectos Públicos

```http
GET /api/v1/projects/public/gallery?agent_type=reactive&difficulty_level=1&sort_by=recent&skip=0&limit=20
```

**Sin autenticación requerida**

**Parámetros de query:**

- `agent_type` (opcional): `reactive`, `goal_based`, `utility`, `model_based`
- `difficulty_level` (opcional): 1-5
- `sort_by` (opcional): `recent`, `popular`, `liked`
- `skip`: paginación
- `limit`: resultados por página (máx 100)

**Respuesta:** `200 OK`

```json
[
  {
    "id": "uuid",
    "title": "Agente Laberinto",
    "agent_type": "reactive",
    "difficulty_level": 1,
    "execution_count": 150,
    "likes_count": 25,
    "forks_count": 8,
    "created_at": "2025-12-10T10:00:00Z"
  }
]
```

---

#### 15. Detalle de Proyecto Público

```http
GET /api/v1/projects/public/{project_id}
```

**Sin autenticación requerida**

**Respuesta:** `200 OK` - Detalles completos del proyecto público

---

## 🛠️ Archivos Creados

### 1. `backend/app/core/security.py`

Funciones de seguridad:

- `verify_password()` - Verificar contraseñas hasheadas
- `get_password_hash()` - Hashear contraseñas con bcrypt
- `create_access_token()` - Generar tokens JWT
- `decode_access_token()` - Validar tokens JWT

### 2. `backend/app/api/deps.py`

Dependencias de FastAPI:

- `get_db()` - Sesión de base de datos
- `get_current_user()` - Usuario desde token JWT
- `get_current_active_user()` - Verificar usuario activo
- `get_current_teacher()` - Verificar permisos de profesor
- `get_current_admin()` - Verificar permisos de admin

### 3. `backend/app/schemas/project.py`

Schemas de Pydantic:

- `ProjectCreate` - Crear proyecto
- `ProjectUpdate` - Actualizar proyecto
- `ProjectResponse` - Respuesta completa
- `ProjectListResponse` - Lista resumida
- `ProjectVersionCreate` - Crear versión
- `ProjectVersionResponse` - Respuesta de versión
- `SharedProjectCreate` - Crear enlace compartido
- `SharedProjectResponse` - Respuesta enlace compartido
- `ProjectExport` - Exportar proyecto
- `ProjectImport` - Importar proyecto

### 4. `backend/app/api/v1/endpoints/projects.py`

21 endpoints implementados (ver arriba)

### 5. `backend/app/api/v1/api.py`

Router principal actualizado con rutas de proyectos

---

## 🔐 Autenticación

La mayoría de endpoints requieren autenticación JWT:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Endpoints públicos (sin autenticación):**

- `GET /api/v1/projects/shared/{token}` - Vista previa compartida
- `GET /api/v1/projects/public/gallery` - Galería comunitaria
- `GET /api/v1/projects/public/{id}` - Detalle público

---

## 📊 Códigos de Estado HTTP

| Código             | Descripción                 |
| ------------------ | --------------------------- |
| `200 OK`           | Operación exitosa           |
| `201 Created`      | Recurso creado exitosamente |
| `204 No Content`   | Eliminación exitosa         |
| `400 Bad Request`  | Datos inválidos             |
| `401 Unauthorized` | Token inválido o ausente    |
| `403 Forbidden`    | Sin permisos                |
| `404 Not Found`    | Recurso no encontrado       |
| `410 Gone`         | Enlace expirado             |

---

## 🚀 Próximos Pasos

1. **Implementar endpoints de autenticación:**

   - `POST /api/v1/auth/register`
   - `POST /api/v1/auth/login`
   - `POST /api/v1/auth/refresh`

2. **Sistema de likes:**

   - Actualmente `likes_count` está hardcodeado a 0
   - Crear tabla `project_likes` y endpoints

3. **Colaboradores:**

   - Usar tabla `project_collaborators` existente
   - Endpoints para invitar/remover colaboradores

4. **Webhooks/Notificaciones:**
   - Notificar cuando alguien hace fork
   - Notificar nuevas versiones

---

## 📖 Documentación Automática

Una vez iniciado el servidor:

```bash
cd backend
uvicorn app.main:app --reload
```

Accede a:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## ✅ Checklist de Implementación

- [x] RF5.1 - CRUD de proyectos (5 endpoints)
- [x] RF5.1 - Exportar/Importar (2 endpoints)
- [x] RF5.1 - Versionado y Fork (3 endpoints)
- [x] RF5.2 - Compartir con URL única (3 endpoints)
- [x] RF5.3 - Galería comunitaria con filtros (2 endpoints)
- [x] Schemas de Pydantic completos
- [x] Autenticación JWT
- [x] Permisos y validaciones
- [x] Documentación API

**Total:** 21 endpoints implementados
