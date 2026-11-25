# Aplicativo Web y Servidor JSON API

Aplicación web interactiva que alimenta y consume en tiempo real la base de datos `message.json` a través de un servidor REST local (`json-server`).

## 🚀 Acceso Rápido
- **URL de la Aplicación Web:** [http://localhost:3000/](http://localhost:3000/)
- **Endpoints de la API:**
  - `http://localhost:3000/aprendices`
  - `http://localhost:3000/programas`
  - `http://localhost:3000/cursos`
  - `http://localhost:3000/instructores`
  - `http://localhost:3000/matriculas`
  - `http://localhost:3000/calificaciones`

---

## 🛠️ Tecnologías y Estructura
- **Base de Datos / Backend:** `json-server` con archivo persistente `message.json`.
- **Frontend Web:** HTML5 Semántico, CSS3 moderno con variables y animaciones, JavaScript modular asíncrono (`fetch` API).
- **Control de Versiones:** Git.

```text
servidor/
├── .gitignore          # Exclusión de node_modules y temporales
├── message.json        # Base de datos JSON (almacenamiento de datos)
├── package.json        # Dependencias y scripts de ejecución
├── public/             # Aplicativo Web servido en http://localhost:3000/
│   ├── index.html      # Estructura de la aplicación web y modales
│   ├── styles.css      # Diseño visual, temas, tipografía y responsive
│   └── app.js          # Lógica CRUD, sincronización y peticiones REST
└── README.md           # Documentación del proyecto
```

---

## ⚡ Comandos de Ejecución

Para iniciar el servidor y la aplicación web:

```bash
npm start
```
o en modo desarrollo:
```bash
npm run dev
```

El servidor quedará disponible en `http://localhost:3000/`.

---

## 📋 Funcionalidades del Aplicativo Web
1. **Recepción de Datos (GET):**
   - Panel de estadísticas en tiempo real (totales de aprendices, cursos, instructores y programas).
   - Listados detallados de cada colección con buscador y filtros dinámicos.
   - Indicador de estado de conexión con el servidor (`Online` / `Offline`).

2. **Alimentación del Servidor (POST / PUT / DELETE):**
   - **Crear nuevos registros:** Formularios con validación para registrar Aprendices, Programas, Cursos, Instructores, Matrículas y Notas.
   - **Edición (Actualización):** Modificación en caliente de registros existentes reflejada al instante en `message.json`.
   - **Eliminación:** Borrado seguro con confirmación previa.
   - **Notificaciones Toast:** Alertas visuales de éxito o error en cada operación.
