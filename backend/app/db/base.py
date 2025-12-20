# backend/app/db/base.py
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# NOTA: No importar modelos aquí para evitar importaciones circulares.
# Los modelos se registran automáticamente cuando se importan en otros lugares.

