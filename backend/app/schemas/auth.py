"""
Schemas de Pydantic para autenticación.
Define modelos de validación para registro, login y tokens.
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from uuid import UUID


# ============================================================================
# USER SCHEMAS
# ============================================================================

class UserBase(BaseModel):
    """Schema base para usuarios"""
    email: EmailStr = Field(..., description="Email del usuario")
    full_name: str = Field(..., min_length=2, max_length=100,
                           description="Nombre completo")


class UserCreate(UserBase):
    """Schema para registrar nuevo usuario"""
    password: str = Field(..., min_length=6, max_length=100,
                          description="Contraseña (mínimo 6 caracteres)")
    username: Optional[str] = Field(
        None, min_length=3, max_length=50, description="Nombre de usuario (opcional)")


class UserResponse(UserBase):
    """Schema para respuesta de usuario"""
    id: UUID
    username: Optional[str] = None
    role_id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# AUTH SCHEMAS
# ============================================================================

class UserLogin(BaseModel):
    """Schema para login"""
    email: EmailStr = Field(..., description="Email del usuario")
    password: str = Field(..., description="Contraseña")


class Token(BaseModel):
    """Schema para respuesta de token"""
    access_token: str = Field(..., description="Token JWT de acceso")
    token_type: str = Field(default="bearer", description="Tipo de token")
    expires_in: int = Field(..., description="Tiempo de expiración en minutos")
    user: UserResponse


class TokenRefresh(BaseModel):
    """Schema para refresh token"""
    refresh_token: str = Field(..., description="Token de actualización")


class PasswordChange(BaseModel):
    """Schema para cambio de contraseña"""
    current_password: str = Field(..., description="Contraseña actual")
    new_password: str = Field(..., min_length=6,
                              max_length=100, description="Nueva contraseña")
