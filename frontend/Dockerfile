# Usamos una imagen ligera de Node
FROM node:20-alpine

# Directorio de trabajo
WORKDIR /app

# Copiamos los archivos de dependencias primero (para aprovechar el caché)
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Construimos la aplicación (Genera la carpeta /app/dist)
RUN npm run build

# Comando tonto para mantener el contenedor encendido
# (Esto permite que Nginx acceda al volumen compartido sin que este contenedor se apague)
CMD ["tail", "-f", "/dev/null"]
