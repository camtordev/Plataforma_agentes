"""
Endpoints para autenticación y gestión de usuarios.
Incluye registro, login, refresh token y cambio de contraseña.
"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.db.models.user import User, Role
from app.schemas.auth import UserCreate, UserLogin, Token, UserResponse, PasswordChange

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Registra un nuevo usuario en la plataforma.

    **Proceso:**
    1. Verifica que el email no esté registrado
    2. Crea usuario con contraseña hasheada
    3. Asigna rol de 'student' por defecto
    4. Retorna token JWT para login automático
    """
    # Verificar si el email ya existe
    existing_user = db.query(User).filter(
        User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )

    # Verificar si el username ya existe (si se proporciona)
    if user_data.username:
        existing_username = db.query(User).filter(
            User.username == user_data.username).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nombre de usuario ya está en uso"
            )

    # Obtener rol de estudiante (default)
    student_role = db.query(Role).filter(Role.name == "student").first()
    if not student_role:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error de configuración: rol 'student' no encontrado"
        )

    # Crear usuario
    user = User(
        email=user_data.email,
        username=user_data.username or user_data.email.split('@')[0],
        full_name=user_data.full_name,
        hashed_password=get_password_hash(user_data.password),
        role_id=student_role.id,
        is_active=True,
        is_verified=False
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # Cargar relación de rol
    db.refresh(user)

    # Crear token JWT
    access_token = create_access_token(
        data={"sub": str(user.id), "role": student_role.name}
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        user=UserResponse.model_validate(user)
    )


@router.post("/login", response_model=Token)
async def login(
    user_credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Inicia sesión con email y contraseña.

    **Proceso:**
    1. Busca usuario por email
    2. Verifica contraseña
    3. Actualiza last_login
    4. Genera token JWT
    """
    # Buscar usuario
    user = db.query(User).filter(User.email == user_credentials.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verificar contraseña
    if not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verificar si el usuario está activo
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo. Contacta al administrador."
        )

    # Actualizar last_login_at
    user.last_login_at = datetime.utcnow()
    db.commit()
    db.refresh(user)

    # Crear token JWT
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.name}
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        user=UserResponse.model_validate(user)
    )


@router.post("/login/oauth", response_model=Token)
async def login_oauth(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Endpoint compatible con OAuth2PasswordBearer.
    Usado por la documentación automática de FastAPI.

    **Nota:** El campo 'username' debe contener el email.
    """
    # El OAuth2PasswordRequestForm usa 'username', pero nosotros usamos email
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )

    # Actualizar last_login_at
    user.last_login_at = datetime.utcnow()
    db.commit()
    db.refresh(user)

    # Crear token JWT
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.name}
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """
    Obtiene información del usuario autenticado.
    """
    return UserResponse.model_validate(current_user)


@router.put("/password", response_model=dict)
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Cambia la contraseña del usuario autenticado.
    """
    # Verificar contraseña actual
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contraseña actual incorrecta"
        )

    # Actualizar contraseña
    current_user.hashed_password = get_password_hash(
        password_data.new_password)
    db.commit()

    return {"message": "Contraseña actualizada exitosamente"}


@router.post("/refresh", response_model=Token)
async def refresh_token(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Genera un nuevo token JWT para el usuario autenticado.
    Útil para renovar sesión sin re-login.
    """
    # Crear nuevo token
    access_token = create_access_token(
        data={"sub": str(current_user.id), "role": current_user.role.name}
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        user=UserResponse.model_validate(current_user)
    )


@router.post("/logout", response_model=dict)
async def logout():
    """
    Endpoint para cerrar sesión. El frontend debe eliminar el token JWT.
    """
    return {"message": "Sesión cerrada correctamente"}
