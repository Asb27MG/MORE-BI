# Despliegue en Render

Este proyecto se despliega con `render.yaml` y crea 2 servicios:

1. `more-bi-backend` (Web Service)
2. `more-bi-frontend` (Static Site)

## 1) Subir repositorio

- Haz push de estos cambios a GitHub.
- En Render, usa **Blueprint** y selecciona este repositorio.
- Render leerá `render.yaml` y creará ambos servicios.

## 2) Configurar variables del backend

En `more-bi-backend`, define:

- `DB_HOST`
- `DB_PORT` (normalmente `3306`)
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `GROQ_API_KEY`
- `GROQ_MODEL` (opcional, ya tiene default)
- `CORS_ORIGIN` (URL del frontend, por ejemplo `https://more-bi-frontend.onrender.com`)

Si quieres varios orígenes, usa una lista separada por comas:

`https://more-bi-frontend.onrender.com,https://tu-dominio.com`

## 3) Configurar variables del frontend

En `more-bi-frontend`, define:

- `VITE_API_URL` con la URL pública del backend.

Ejemplo:

`https://more-bi-backend.onrender.com`

## 4) Verificaciones rápidas

- Backend health: `GET /health`
- API base: `GET /api`
- Frontend formulario: debe enviar a `/api/consultas`
- Demo IA: `/ia-demo.html`

## Nota sobre `ia-demo.html`

`frontend/public/js/ia-demo.js` resuelve la API así:

1. `?apiBase=...` en la URL (prioridad alta)
2. `window.__MORE_BI_API_BASE__` si lo defines
3. Detecta Render y cambia `-frontend` por `-backend`
4. Si no, usa mismo origen (`/api/chat`)

Con los nombres sugeridos en `render.yaml` (`more-bi-frontend` y `more-bi-backend`) debería funcionar sin configuración extra.
