# Stage 1: Builder
FROM node:18 AS builder

WORKDIR /app

# Instala las dependencias necesarias para compilación
RUN apt-get update && apt-get install -y python3 make g++

# Copia los archivos de paquetes primero
COPY package.json package-lock.json ./

# Limpieza y reinstalación limpia
RUN rm -rf node_modules package-lock.json && \
    npm install --force && \
    npm cache clean --force

# Copia el resto de los archivos
COPY . .

# Construye la aplicación
RUN npm run build

# Stage 2: Production
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]