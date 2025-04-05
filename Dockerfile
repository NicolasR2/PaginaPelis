# Usa la imagen oficial de Node.js
FROM node:18 AS builder

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos necesarios
COPY package.json package-lock.json ./


# Instala las dependencias


RUN npm install typescript -g && npm install --save-dev typescript
RUN npm install


# Copia el resto del código
COPY . .

# Construye la aplicación
RUN npm run build

# Usa una imagen ligera de Nginx para servir el frontend
FROM nginx:alpine

# Copia los archivos generados en la build de React
COPY --from=builder /app/dist /usr/share/nginx/html

# Expone el puerto 80
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]
