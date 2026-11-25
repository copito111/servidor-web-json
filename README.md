# 🚀 Sistema de Gestión Académica - Servidor JSON & Web App

Aplicación web interactiva que alimenta y consume en tiempo real la base de datos `message.json` mediante una API REST local impulsada por `json-server`.

Repositorio oficial: [https://github.com/copito111/servidor-web-json](https://github.com/copito111/servidor-web-json)

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu computador:
- **[Node.js](https://nodejs.org/)** (versión 18 o superior).
- **[Git](https://git-scm.com/)**.

---

## 📥 Instalación y Puesta en Marcha (Paso a Paso)

Sigue estos sencillos pasos para clonar y ejecutar el proyecto localmente:

### 1. Clonar el repositorio
Abre una terminal (PowerShell, CMD o Git Bash) y ejecuta:

```bash
git clone https://github.com/copito111/servidor-web-json.git
cd servidor-web-json
```

### 2. Instalar las dependencias
Instala los paquetes necesarios definidos en `package.json` (`json-server`):

```bash
npm install
```

### 3. Iniciar el servidor
Ejecuta el siguiente comando para levantar el servidor backend y servir la app web:

```bash
npm start
```
*(También puedes usar `npm run dev` para modo desarrollo).*

### 4. Abrir la aplicación en el navegador
Una vez iniciado el servidor, abre tu navegador web e ingresa a:

👉 **[http://localhost:3000/](http://localhost:3000/)**

---

## 🌐 Endpoints de la API REST

El servidor expone automáticamente los siguientes endpoints JSON para operaciones CRUD (GET, POST, PUT, DELETE):

| Endpoint | Descripción |
| :--- | :--- |
| `http://localhost:3000/aprendices` | Gestión de aprendices registrados |
| `http://localhost:3000/programas` | Programas de formación técnica y tecnológica |
| `http://localhost:3000/cursos` | Cursos activos y ofertados |
| `http://localhost:3000/instructores` | Registro de instructores y especialidades |
| `http://localhost:3000/matriculas` | Asignación de aprendices a cursos |
| `http://localhost:3000/calificaciones` | Registro de notas y observaciones |

---

## ✨ Características del Aplicativo Web

- **📊 Dashboard en Tiempo Real:** Métricas automáticas de aprendices, instructores, cursos y programas.
- **📥 Recepción de Datos (GET):** Consulta dinámica de colecciones, filtros por estado y buscador en tiempo real.
- **📝 Alimentación del Servidor (POST / PUT):** Formularios con validación para agregar nuevos registros o actualizar existentes directamente en `message.json`.
- **🗑️ Eliminación Segura (DELETE):** Confirmación previa antes de remover datos de la base de datos.
- **🔔 Notificaciones Toast:** Alertas visuales de confirmación de operaciones exitosas o errores de red.
- **🟢 Monitor de Estado:** Indicador en la barra superior que verifica si el servidor en el puerto 3000 está en línea.

---

## 📂 Estructura del Proyecto

```text
servidor-web-json/
├── .gitignore          # Archivos excluidos del control de versiones (node_modules, etc.)
├── message.json        # Base de datos JSON persistente
├── package.json        # Configuración de scripts y dependencias
├── public/             # Frontend servido en http://localhost:3000/
│   ├── index.html      # Interfaz de usuario, modales y formularios
│   ├── styles.css      # Estilos modernos, diseño responsivo y temas
│   └── app.js          # Consumo de API REST (fetch), eventos y reactividad
└── README.md           # Guía de instalación y documentación
```

---

## 🛠️ Subir Nuevos Cambios a GitHub

Si realizas modificaciones en el código y deseas enviarlas a tu repositorio remoto:

```bash
git add .
git commit -m "Descripción de los cambios realizados"
git push origin main
```
