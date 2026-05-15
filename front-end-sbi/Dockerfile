FROM ubuntu:22.04

# ---------- CONFIGURACIÓN BASE ----------
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    curl \
    git \
    bash \
    build-essential

# ---------- INSTALAR NVM ----------
ENV NVM_DIR=/root/.nvm
ENV NODE_VERSION=20.19.0

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# ---------- INSTALAR NODE + NPM ----------
RUN . "$NVM_DIR/nvm.sh" \
    && nvm install $NODE_VERSION \
    && nvm use $NODE_VERSION \
    && nvm alias default $NODE_VERSION

# Export PATH para Node & NPM global
ENV PATH="$NVM_DIR/versions/node/v20.19.0/bin/:${PATH}"

# ---------- INSTALAR ANGULAR CLI ----------
RUN npm install -g @angular/cli@21.2.0 --ignore-scripts

# ---------- INSTALAR DEPENDENCIAS ----------
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps --ignore-scripts

# ---------- COPIAR CÓDIGO FUENTE ----------
COPY . .

# Puerto Angular
EXPOSE 4200

# ---------- SERVIDOR DE DESARROLLO ----------
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--disable-host-check", "--proxy-config", "proxy.conf.js"]
