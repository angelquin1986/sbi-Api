# SBI Frontend — Angular (front-end-sbi)

Frontend de **Experience Southamerica** desarrollado con Angular 6.
Se conecta al backend REST en `http://localhost:4000` (proyecto `gouland/`).

---

## Requisitos previos

| Herramienta    | Versión   |
|----------------|-----------|
| Docker         | 24+       |
| Docker Compose | v2+       |
| Node.js        | 10.24.1 (solo para desarrollo local sin Docker) |

---

## 🐳 Opción A — Levantar con Docker (recomendado)

> 📍 Ejecutar desde la carpeta **`front-end-sbi/`** en tu máquina local.
> No necesitas tener Node ni Angular CLI instalados.

```bash
# Paso 1 — Posicionarse en la carpeta del frontend
cd front-end-sbi

# Paso 2 — Construir la imagen Docker
#   (la primera vez tarda varios minutos — instala ~800MB de dependencias)
docker build -t sbi-frontend .

# Paso 3 — Levantar el contenedor
docker run -p 4200:4200 sbi-frontend
```

Frontend disponible en: **http://localhost:4200**

> ⚠️ Asegúrate de que el backend Go esté corriendo en `http://localhost:4000`
> antes de abrir el frontend. Ver instrucciones en `gouland/README.md`.

---

## 🐳 Opción B — Stack completo (MongoDB + API Go + Frontend juntos)

> 📍 Ejecutar desde la carpeta **`gouland/`**. Levanta los 3 servicios con un solo comando.

```bash
# Paso 1 — Posicionarse en gouland/
cd gouland

# Paso 2 — Construir e iniciar todos los servicios en segundo plano
#   (la primera vez tarda varios minutos)
docker compose up --build -d

# Paso 3 — Verificar que los 3 servicios están corriendo
docker compose ps
# Debes ver: mongo (healthy), api (running), frontend (running)

# Paso 4 — Poblar la base de datos con datos dummy
docker compose exec api /app/seed

# Paso 5 — Abrir el frontend en el navegador
open http://localhost:4200
```

Servicios disponibles:

| Servicio | URL                       | Descripción         |
|----------|---------------------------|---------------------|
| Frontend | http://localhost:4200     | Angular SPA         |
| API Go   | http://localhost:4000     | Backend REST        |
| MongoDB  | interno (sin puerto host) | Base de datos       |

Ver logs en tiempo real:
```bash
docker compose logs -f frontend   # logs del Angular
docker compose logs -f api        # logs del Go
```

Detener todo:
```bash
docker compose down
```

---

## 💻 Opción C — Desarrollo local (sin Docker)

> 📍 Requiere Node 10.24.1 instalado en tu máquina.

```bash
# Paso 1 — Instalar dependencias (solo la primera vez)
cd front-end-sbi
npm install

# Paso 2 — Iniciar el servidor de desarrollo
npm start
# → http://localhost:4200 con hot-reload automático
```

---

## Configuración del backend

El archivo `src/environments/environment.ts` controla a qué backend apunta el frontend:

| Entorno     | Archivo                   | URL configurada           |
|-------------|---------------------------|---------------------------|
| Desarrollo  | `environment.ts`          | `http://localhost:4000`   |
| Producción  | `environment.prod.ts`     | `https://rest.galapagosislands.com` |

Para cambiar el backend en desarrollo, edita `src/environments/environment.ts`:
```typescript
urlServicesServer: 'http://localhost:4000',   // ← backend Go local
// urlServicesServer: 'http://localhost:3000', // ← backend Node local
```

---

## Build para producción

```bash
ng build --prod
# Archivos generados en: dist/secure-booking-information/
```


To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
