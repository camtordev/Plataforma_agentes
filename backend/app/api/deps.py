"""
Dependencias de FastAPI para inyección en rutas.
Incluye gestión de sesiones de BD y autenticación de usuarios.
"""
from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.models.user import User
from app.core.security import decode_access_token

# Esquema OAuth2 para extracción de token del header Authorization
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_db() -> Generator:
    """
    Genera una sesión de base de datos para cada request.
    Se cierra automáticamente al finalizar.

    Yields:
        Session: Sesión de SQLAlchemy
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Obtiene el usuario actual desde el token JWT.

    Args:
        token: Token JWT del header Authorization
        db: Sesión de base de datos

    Returns:
        Usuario autenticado

    Raises:
        HTTPException 401: Si el token es inválido o el usuario no existe
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Decodificar token
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    # Buscar usuario en BD
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Verifica que el usuario actual esté activo.

    Args:
        current_user: Usuario obtenido del token

    Returns:
        Usuario activo

    Raises:
        HTTPException 400: Si el usuario está inactivo
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )
    return current_user


def get_current_teacher(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Verifica que el usuario actual sea profesor.

    Args:
        current_user: Usuario autenticado

    Returns:
        Usuario con rol de profesor

    Raises:
        HTTPException 403: Si el usuario no es profesor
    """
    if current_user.role.name not in ["teacher", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permisos insuficientes. Se requiere rol de profesor."
        )
    return current_user


def get_current_admin(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Verifica que el usuario actual sea administrador.

    Args:
        current_user: Usuario autenticado

    Returns:
        Usuario con rol de admin

    Raises:
        HTTPException 403: Si el usuario no es admin
    """
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permisos insuficientes. Se requiere rol de administrador."
        )
    return current_user
