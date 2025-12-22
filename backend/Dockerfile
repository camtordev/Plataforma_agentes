# 1. Usar una imagen ligera de Python
FROM python:3.10-slim

# 2. Establecer directorio de trabajo
WORKDIR /app

# 3. Instalar dependencias del sistema necesarias para PostgreSQL (psycopg2)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 4. Copiar el archivo de requerimientos
COPY requirements.txt .

# 5. Instalar las librerías de Python
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copiar el resto del código del backend
COPY . .

# 7. Exponer el puerto (informativo)
EXPOSE 8000

# 8. Comando por defecto (aunque docker-compose lo sobrescribe, es bueno tenerlo)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
