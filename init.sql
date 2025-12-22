-- Habilitar UUIDs
create extension if not exists "pgcrypto";

begin;

-- ========== Módulo 1: Autenticación ==========
create table if not exists roles (
  id serial primary key,
  name varchar(50) unique not null,
  description text,
  permissions jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username varchar(50) unique not null,
  email varchar(255) unique not null,
  hashed_password varchar(255) not null,
  full_name varchar(100),
  avatar_url varchar(500),
  bio text,
  role_id integer not null references roles(id),
  is_active boolean not null default true,
  is_verified boolean not null default false,
  email_verified_at timestamptz,
  total_projects integer not null default 0,
  total_likes_received integer not null default 0,
  total_followers integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

create index if not exists idx_users_created_at on users(created_at);

create table if not exists user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_jti varchar(255) unique not null,
  refresh_token varchar(500),
  ip_address varchar(45),
  user_agent text,
  is_active boolean not null default true,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now()
);
create index if not exists idx_sessions_user on user_sessions(user_id);
create index if not exists idx_sessions_expires on user_sessions(expires_at);

-- ========== Módulo 2: Proyectos ==========
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title varchar(200) not null,
  description text,
  thumbnail_url varchar(500),
  is_public boolean not null default false,
  is_template boolean not null default false,
  fork_from_id uuid references projects(id),
  grid_width integer not null default 25,
  grid_height integer not null default 25,
  cell_size integer not null default 20,
  user_code text,
  code_language varchar(20) not null default 'python',
  world_state jsonb,
  simulation_config jsonb,
  agent_type varchar(50),
  difficulty_level integer,
  difficulty varchar(20),
  forks_count integer not null default 0,
  execution_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint check_grid_width check (grid_width between 5 and 50),
  constraint check_grid_height check (grid_height between 5 and 50),
  constraint check_cell_size check (cell_size between 10 and 50),
  constraint check_difficulty check (
    difficulty in ('beginner','intermediate','advanced','expert') or difficulty is null
  )
);
create index if not exists idx_projects_public_popular on projects(is_public, created_at);
create index if not exists idx_projects_user_created on projects(user_id, created_at);

create table if not exists shared_projects (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  share_token varchar(64) unique not null,
  share_type varchar(20) not null,
  password_hash varchar(255),
  expires_at timestamptz,
  max_views integer,
  current_views integer not null default 0,
  is_active boolean not null default true,
  allow_fork boolean not null default true,
  allow_download boolean not null default true,
  created_at timestamptz not null default now(),
  last_accessed_at timestamptz,
  constraint check_share_type check (share_type in ('view','edit','embed'))
);
create index if not exists idx_shared_project on shared_projects(project_id);
create index if not exists idx_shared_token on shared_projects(share_token);

create table if not exists project_collaborators (
  id serial primary key,
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  permission_level varchar(20) not null,
  invited_by uuid references users(id),
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  status varchar(20) not null default 'pending',
  constraint check_permission_level check (permission_level in ('viewer','editor','admin')),
  constraint check_status_collab check (status in ('pending','active','revoked'))
);
create unique index if not exists idx_collaborators_unique on project_collaborators(project_id, user_id);
create index if not exists idx_collaborators_project on project_collaborators(project_id);
create index if not exists idx_collaborators_user on project_collaborators(user_id);

-- ========== Módulo 3: Tutoriales (simplificado) ==========
create table if not exists tutorials (
  id serial primary key,
  level integer not null unique,
  slug varchar(100) not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_tutorial_level check (level between 1 and 20)
);
create index if not exists idx_tutorials_level on tutorials(level);
create index if not exists idx_tutorials_slug on tutorials(slug);
create index if not exists idx_tutorials_is_active on tutorials(is_active);

create table if not exists user_progress (
  id serial primary key,
  user_id uuid not null references users(id) on delete cascade,
  tutorial_id integer not null references tutorials(id) on delete cascade,
  status varchar(20) not null default 'not_started',
  current_code text,
  time_spent_seconds integer not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint check_progress_status check (status in ('not_started','in_progress','completed'))
);
create unique index if not exists idx_progress_unique on user_progress(user_id, tutorial_id);
create index if not exists idx_progress_user on user_progress(user_id);
create index if not exists idx_progress_tutorial on user_progress(tutorial_id);
create index if not exists idx_progress_status on user_progress(status);

-- ========== Módulo 4: Métricas ==========
create table if not exists simulation_metrics (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  tutorial_id integer references tutorials(id) on delete set null,
  simulation_duration_ms integer,
  total_steps integer not null,
  final_step_reached integer not null,
  total_agents integer not null,
  agents_survived integer not null,
  total_food_collected integer not null default 0,
  total_energy_consumed integer not null default 0,
  total_collisions integer not null default 0,
  grid_coverage_percent numeric(5,2),
  efficiency_score numeric(5,2),
  success boolean not null,
  started_at timestamptz not null,
  finished_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_metrics_user_created on simulation_metrics(user_id, created_at);
create index if not exists idx_metrics_tutorial on simulation_metrics(tutorial_id, created_at);

create table if not exists agent_metrics (
  id uuid primary key default gen_random_uuid(),
  simulation_metrics_id uuid not null references simulation_metrics(id) on delete cascade,
  agent_id varchar(100) not null,
  agent_type varchar(50) not null,
  steps_alive integer not null,
  distance_traveled integer not null default 0,
  food_collected integer not null default 0,
  energy_consumed integer not null default 0,
  energy_at_end integer not null default 0,
  collisions_count integer not null default 0,
  cells_visited integer not null default 0,
  path_data jsonb,
  energy_over_time jsonb,
  died_at_step integer,
  death_reason varchar(50),
  success boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_agent_metrics_simulation_type on agent_metrics(simulation_metrics_id, agent_type);

create table if not exists heatmap_data (
  id uuid primary key default gen_random_uuid(),
  simulation_metrics_id uuid not null unique references simulation_metrics(id) on delete cascade,
  grid_width integer not null,
  grid_height integer not null,
  visit_matrix jsonb not null,
  max_visits integer not null,
  hotspots jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_heatmap_simulation on heatmap_data(simulation_metrics_id);

commit;

-- Semillas opcionales de roles
insert into roles (id, name, description, permissions)
values
  (1, 'student', 'Estudiante con acceso básico', '{"can_create_projects": true, "can_delete_own_projects": true, "max_projects": 100, "can_view_public_projects": true}'),
  (2, 'teacher', 'Profesor con permisos para crear tutoriales', '{"can_create_projects": true, "can_create_tutorials": true, "can_view_student_stats": true, "can_moderate_comments": true, "max_projects": 500}'),
  (3, 'admin', 'Administrador con control total', '{"can_do_everything": true}')
on conflict (id) do nothing;

INSERT INTO tutorials (level, slug, is_active)
VALUES
  (1, 'introduccion-agentes-entornos', TRUE),
  (2, 'acciones-basicas', TRUE),
  (3, 'percepcion-sensores', TRUE),
  (4, 'recompensas-objetivos', TRUE),
  (5, 'politicas-heuristicas', TRUE),
  (6, 'exploracion-explotacion', TRUE),
  (7, 'introduccion-q-learning', TRUE),
  (8, 'q-learning-aplicado', TRUE);
