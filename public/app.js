// Configuración de la API del servidor JSON
const API_BASE = window.location.origin;

// Estado global de la aplicación
const state = {
  aprendices: [],
  programas: [],
  cursos: [],
  instructores: [],
  matriculas: [],
  calificaciones: [],
  serverOnline: false
};

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  fetchAllData();

  // Botón refrescar
  const btnRefresh = document.getElementById('btnRefreshAll');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      showToast('Sincronizando datos con el servidor...', 'info');
      fetchAllData();
    });
  }

  // Pre-llenar fecha actual en modales
  const today = new Date().toISOString().split('T')[0];
  const matFecha = document.getElementById('matFecha');
  const califFecha = document.getElementById('califFecha');
  if (matFecha) matFecha.value = today;
  if (califFecha) califFecha.value = today;
});

// Navegación entre pestañas
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabName = item.getAttribute('data-tab');
      switchTab(tabName);
    });
  });
}

function switchTab(tabName) {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
  });
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === `tab-${tabName}`);
  });
}

// ==================== COMUNICACIÓN CON LA API ====================

// Obtener todos los datos del servidor JSON
async function fetchAllData() {
  updateServerStatus(null, 'Comprobando conexión...');
  try {
    const [
      resAprendices,
      resProgramas,
      resCursos,
      resInstructores,
      resMatriculas,
      resCalificaciones
    ] = await Promise.all([
      fetch(`${API_BASE}/aprendices`),
      fetch(`${API_BASE}/programas`),
      fetch(`${API_BASE}/cursos`),
      fetch(`${API_BASE}/instructores`),
      fetch(`${API_BASE}/matriculas`),
      fetch(`${API_BASE}/calificaciones`)
    ]);

    if (!resAprendices.ok) throw new Error('Error al conectar con la API');

    state.aprendices = await resAprendices.json();
    state.programas = await resProgramas.json();
    state.cursos = await resCursos.json();
    state.instructores = await resInstructores.json();
    state.matriculas = await resMatriculas.json();
    state.calificaciones = await resCalificaciones.json();

    state.serverOnline = true;
    updateServerStatus(true, 'Conectado a http://localhost:3000');
    renderAll();
  } catch (err) {
    console.error('Error cargando datos del servidor:', err);
    state.serverOnline = false;
    updateServerStatus(false, 'Servidor desconectado');
    showToast('No se pudo conectar con http://localhost:3000', 'error');
  }
}

function updateServerStatus(online, text) {
  const badge = document.getElementById('serverStatus');
  if (!badge) return;
  badge.className = 'status-badge';
  if (online === true) {
    badge.classList.add('online');
  } else if (online === false) {
    badge.classList.add('offline');
  } else {
    badge.classList.add('checking');
  }
  const statusText = badge.querySelector('.status-text');
  if (statusText) statusText.textContent = text;
}

// ==================== RENDERIZADO ====================

function renderAll() {
  updateBadges();
  renderDashboard();
  renderAprendices();
  renderProgramas();
  renderCursos();
  renderInstructores();
  renderMatriculas();
  populateSelects();
}

function updateBadges() {
  document.getElementById('countBadgeAprendices').textContent = state.aprendices.length;
  document.getElementById('countBadgeProgramas').textContent = state.programas.length;
  document.getElementById('countBadgeCursos').textContent = state.cursos.length;
  document.getElementById('countBadgeInstructores').textContent = state.instructores.length;
  document.getElementById('countBadgeMatriculas').textContent = state.matriculas.length;

  document.getElementById('statAprendices').textContent = state.aprendices.length;
  document.getElementById('statProgramas').textContent = state.programas.length;
  document.getElementById('statCursos').textContent = state.cursos.length;
  document.getElementById('statInstructores').textContent = state.instructores.length;
}

function renderDashboard() {
  // Últimos aprendices
  const recentBox = document.getElementById('dashboardRecentAprendices');
  if (recentBox) {
    if (state.aprendices.length === 0) {
      recentBox.innerHTML = '<p class="text-muted">No hay aprendices registrados aún.</p>';
    } else {
      const recents = [...state.aprendices].slice(-4).reverse();
      recentBox.innerHTML = recents.map(ap => `
        <div class="list-item">
          <div>
            <div class="list-item-title">${escapeHtml(ap.nombres)} ${escapeHtml(ap.apellidos)}</div>
            <div class="list-item-subtitle">${escapeHtml(ap.documento)} &bull; ${escapeHtml(ap.correo)}</div>
          </div>
          <span class="chip ${ap.estado === 'Activo' ? 'chip-active' : 'chip-inactivo'}">${ap.estado}</span>
        </div>
      `).join('');
    }
  }

  // Cursos disponibles
  const cursosBox = document.getElementById('dashboardRecentCursos');
  if (cursosBox) {
    if (state.cursos.length === 0) {
      cursosBox.innerHTML = '<p class="text-muted">No hay cursos registrados aún.</p>';
    } else {
      cursosBox.innerHTML = state.cursos.slice(0, 4).map(c => `
        <div class="list-item">
          <div>
            <div class="list-item-title">${escapeHtml(c.nombre)}</div>
            <div class="list-item-subtitle">${c.horas} horas &bull; ${escapeHtml(c.descripcion || '')}</div>
          </div>
          <span class="chip chip-neutral">${c.estado || 'Disponible'}</span>
        </div>
      `).join('');
    }
  }
}

// Renderizado Aprendices
function renderAprendices(list = state.aprendices) {
  const tbody = document.getElementById('tbodyAprendices');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No se encontraron aprendices.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(ap => `
    <tr>
      <td><strong>${escapeHtml(ap.documento)}</strong></td>
      <td>
        <div>${escapeHtml(ap.nombres)} ${escapeHtml(ap.apellidos)}</div>
        <small class="text-muted">Nacimiento: ${ap.fechaNacimiento || 'N/A'}</small>
      </td>
      <td>
        <div>${escapeHtml(ap.correo)}</div>
        <small class="text-muted">${escapeHtml(ap.telefono || 'Sin tel')}</small>
      </td>
      <td>${escapeHtml(ap.ciudad || 'No especificada')}</td>
      <td>
        <span class="chip ${ap.estado === 'Activo' ? 'chip-active' : 'chip-inactivo'}">${ap.estado}</span>
      </td>
      <td style="text-align: right;">
        <button class="btn btn-secondary btn-sm" onclick="editAprendiz('${ap.id}')">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="deleteRecord('aprendices', '${ap.id}')">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

function filterAprendices() {
  const query = document.getElementById('searchAprendiz').value.toLowerCase().trim();
  const estadoFilter = document.getElementById('filterEstadoAprendiz').value;

  const filtered = state.aprendices.filter(ap => {
    const matchesQuery = !query ||
      ap.nombres.toLowerCase().includes(query) ||
      ap.apellidos.toLowerCase().includes(query) ||
      ap.documento.toLowerCase().includes(query) ||
      ap.correo.toLowerCase().includes(query);

    const matchesEstado = !estadoFilter || ap.estado === estadoFilter;
    return matchesQuery && matchesEstado;
  });

  renderAprendices(filtered);
}

// Renderizado Programas
function renderProgramas() {
  const grid = document.getElementById('gridProgramas');
  if (!grid) return;

  if (state.programas.length === 0) {
    grid.innerHTML = '<p class="text-muted">No hay programas de formación disponibles.</p>';
    return;
  }

  grid.innerHTML = state.programas.map(prog => `
    <div class="program-card">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <span class="program-badge">${escapeHtml(prog.codigo)}</span>
          <span class="chip ${prog.estado ? 'chip-active' : 'chip-inactivo'}">${prog.estado ? 'Activo' : 'Inactivo'}</span>
        </div>
        <h3 style="font-size: 1.1rem; margin-bottom: 6px;">${escapeHtml(prog.nombre)}</h3>
        <p class="text-muted" style="font-size: 0.85rem;">Nivel: <strong>${escapeHtml(prog.nivel)}</strong></p>
        <p class="text-muted" style="font-size: 0.85rem;">Duración: ${prog.duracion} meses</p>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid var(--border); padding-top: 12px;">
        <button class="btn btn-secondary btn-sm" onclick="editPrograma('${prog.id}')">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="deleteRecord('programas', '${prog.id}')">Eliminar</button>
      </div>
    </div>
  `).join('');
}

// Renderizado Cursos
function renderCursos() {
  const tbody = document.getElementById('tbodyCursos');
  if (!tbody) return;

  if (state.cursos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No hay cursos registrados.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.cursos.map(c => {
    const instructor = state.instructores.find(i => String(i.id) === String(c.instructorId));
    const instNombre = instructor ? `${instructor.nombres} ${instructor.apellidos}` : 'Sin asignar';

    return `
      <tr>
        <td><strong>${escapeHtml(c.nombre)}</strong></td>
        <td>${escapeHtml(c.descripcion || '-')}</td>
        <td>${c.horas} horas</td>
        <td>${escapeHtml(instNombre)}</td>
        <td><span class="chip chip-neutral">${c.estado || 'Disponible'}</span></td>
        <td style="text-align: right;">
          <button class="btn btn-secondary btn-sm" onclick="editCurso('${c.id}')">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="deleteRecord('cursos', '${c.id}')">Eliminar</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Renderizado Instructores
function renderInstructores() {
  const tbody = document.getElementById('tbodyInstructores');
  if (!tbody) return;

  if (state.instructores.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No hay instructores registrados.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.instructores.map(inst => `
    <tr>
      <td><strong>${escapeHtml(inst.documento)}</strong></td>
      <td>${escapeHtml(inst.nombres)} ${escapeHtml(inst.apellidos)}</td>
      <td>${escapeHtml(inst.correo)}</td>
      <td><span class="chip chip-neutral">${escapeHtml(inst.especialidad)}</span></td>
      <td><span class="chip ${inst.estado !== false ? 'chip-active' : 'chip-inactivo'}">${inst.estado !== false ? 'Activo' : 'Inactivo'}</span></td>
      <td style="text-align: right;">
        <button class="btn btn-secondary btn-sm" onclick="editInstructor('${inst.id}')">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="deleteRecord('instructores', '${inst.id}')">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

// Renderizado Matrículas
function renderMatriculas() {
  const tbody = document.getElementById('tbodyMatriculas');
  if (!tbody) return;

  if (state.matriculas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No hay matrículas registradas.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.matriculas.map(mat => {
    const aprendiz = state.aprendices.find(a => String(a.id) === String(mat.aprendizId));
    const curso = state.cursos.find(c => String(c.id) === String(mat.cursoId));
    const calif = state.calificaciones.find(q => String(q.matriculaId) === String(mat.id));

    const apNombre = aprendiz ? `${aprendiz.nombres} ${aprendiz.apellidos}` : `ID #${mat.aprendizId}`;
    const cursoNombre = curso ? curso.nombre : `ID #${mat.cursoId}`;

    let califHtml = `<button class="btn btn-secondary btn-sm" onclick="openModalCalificacion('${mat.id}', '${escapeHtml(apNombre)}', '${escapeHtml(cursoNombre)}')">+ Calificar</button>`;
    if (calif) {
      califHtml = `
        <div style="cursor: pointer;" onclick="openModalCalificacion('${mat.id}', '${escapeHtml(apNombre)}', '${escapeHtml(cursoNombre)}')">
          <strong style="color: ${calif.nota >= 3.0 ? '#059669' : '#dc2626'}; font-size: 1rem;">${calif.nota}</strong>
          <small class="text-muted" style="display: block;">${escapeHtml(calif.observacion || '')}</small>
        </div>
      `;
    }

    return `
      <tr>
        <td>#${mat.id}</td>
        <td><strong>${escapeHtml(apNombre)}</strong></td>
        <td>${escapeHtml(cursoNombre)}</td>
        <td>${mat.fechaMatricula || '-'}</td>
        <td><span class="chip ${mat.estado === 'Matriculado' ? 'chip-matriculado' : 'chip-retirado'}">${mat.estado}</span></td>
        <td>${califHtml}</td>
        <td style="text-align: right;">
          <button class="btn btn-danger btn-sm" onclick="deleteRecord('matriculas', '${mat.id}')">Eliminar</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Llenar selects dinámicos
function populateSelects() {
  // Instructores para cursos
  const selectInst = document.getElementById('cursoInstructorId');
  if (selectInst) {
    selectInst.innerHTML = '<option value="">Seleccione instructor...</option>' +
      state.instructores.map(i => `<option value="${i.id}">${escapeHtml(i.nombres)} ${escapeHtml(i.apellidos)} (${escapeHtml(i.especialidad)})</option>`).join('');
  }

  // Aprendices para matrícula
  const selectMatAp = document.getElementById('matAprendizId');
  if (selectMatAp) {
    selectMatAp.innerHTML = '<option value="">Seleccione aprendiz...</option>' +
      state.aprendices.map(a => `<option value="${a.id}">${escapeHtml(a.nombres)} ${escapeHtml(a.apellidos)} - ${a.documento}</option>`).join('');
  }

  // Cursos para matrícula
  const selectMatCurso = document.getElementById('matCursoId');
  if (selectMatCurso) {
    selectMatCurso.innerHTML = '<option value="">Seleccione curso...</option>' +
      state.cursos.map(c => `<option value="${c.id}">${escapeHtml(c.nombre)}</option>`).join('');
  }
}

// ==================== ALIMENTAR SERVIDOR (CRUD - POST / PUT / DELETE) ====================

// Guardar Aprendiz (POST o PUT)
async function saveAprendiz(e) {
  e.preventDefault();
  const id = document.getElementById('aprendizId').value;
  const data = {
    documento: document.getElementById('aprendizDoc').value.trim(),
    nombres: document.getElementById('aprendizNombres').value.trim(),
    apellidos: document.getElementById('aprendizApellidos').value.trim(),
    correo: document.getElementById('aprendizCorreo').value.trim(),
    telefono: document.getElementById('aprendizTelefono').value.trim(),
    ciudad: document.getElementById('aprendizCiudad').value.trim(),
    fechaNacimiento: document.getElementById('aprendizFechaNac').value,
    estado: document.getElementById('aprendizEstado').value
  };

  try {
    if (id) {
      await apiRequest(`/aprendices/${id}`, 'PUT', data);
      showToast('Aprendiz actualizado con éxito', 'success');
    } else {
      await apiRequest('/aprendices', 'POST', data);
      showToast('Aprendiz guardado en el servidor JSON', 'success');
    }
    closeModal('modalAprendiz');
    await fetchAllData();
  } catch (err) {
    showToast(`Error al guardar: ${err.message}`, 'error');
  }
}

function editAprendiz(id) {
  const item = state.aprendices.find(a => String(a.id) === String(id));
  if (!item) return;

  document.getElementById('modalAprendizTitle').textContent = 'Editar Aprendiz';
  document.getElementById('aprendizId').value = item.id;
  document.getElementById('aprendizDoc').value = item.documento || '';
  document.getElementById('aprendizNombres').value = item.nombres || '';
  document.getElementById('aprendizApellidos').value = item.apellidos || '';
  document.getElementById('aprendizCorreo').value = item.correo || '';
  document.getElementById('aprendizTelefono').value = item.telefono || '';
  document.getElementById('aprendizCiudad').value = item.ciudad || '';
  document.getElementById('aprendizFechaNac').value = item.fechaNacimiento || '';
  document.getElementById('aprendizEstado').value = item.estado || 'Activo';

  openModal('modalAprendiz');
}

// Guardar Programa
async function savePrograma(e) {
  e.preventDefault();
  const id = document.getElementById('programaId').value;
  const data = {
    nombre: document.getElementById('programaNombre').value.trim(),
    codigo: document.getElementById('programaCodigo').value.trim().toUpperCase(),
    nivel: document.getElementById('programaNivel').value,
    duracion: parseInt(document.getElementById('programaDuracion').value, 10),
    estado: document.getElementById('programaEstado').value === 'true'
  };

  try {
    if (id) {
      await apiRequest(`/programas/${id}`, 'PUT', data);
      showToast('Programa actualizado con éxito', 'success');
    } else {
      await apiRequest('/programas', 'POST', data);
      showToast('Programa registrado en el JSON', 'success');
    }
    closeModal('modalPrograma');
    await fetchAllData();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

function editPrograma(id) {
  const item = state.programas.find(p => String(p.id) === String(id));
  if (!item) return;

  document.getElementById('modalProgramaTitle').textContent = 'Editar Programa';
  document.getElementById('programaId').value = item.id;
  document.getElementById('programaNombre').value = item.nombre;
  document.getElementById('programaCodigo').value = item.codigo;
  document.getElementById('programaNivel').value = item.nivel;
  document.getElementById('programaDuracion').value = item.duracion;
  document.getElementById('programaEstado').value = item.estado ? 'true' : 'false';

  openModal('modalPrograma');
}

// Guardar Curso
async function saveCurso(e) {
  e.preventDefault();
  const id = document.getElementById('cursoId').value;
  const rawInstructorId = document.getElementById('cursoInstructorId').value;
  const data = {
    nombre: document.getElementById('cursoNombre').value.trim(),
    descripcion: document.getElementById('cursoDesc').value.trim(),
    horas: parseInt(document.getElementById('cursoHoras').value, 10) || 0,
    instructorId: rawInstructorId ? (isNaN(rawInstructorId) ? rawInstructorId : Number(rawInstructorId)) : null,
    estado: document.getElementById('cursoEstado').value
  };

  try {
    if (id) {
      await apiRequest(`/cursos/${id}`, 'PUT', data);
      showToast('Curso modificado correctamente', 'success');
    } else {
      await apiRequest('/cursos', 'POST', data);
      showToast('Curso añadido al servidor', 'success');
    }
    closeModal('modalCurso');
    await fetchAllData();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

function editCurso(id) {
  const item = state.cursos.find(c => String(c.id) === String(id));
  if (!item) return;

  document.getElementById('modalCursoTitle').textContent = 'Editar Curso';
  document.getElementById('cursoId').value = item.id;
  document.getElementById('cursoNombre').value = item.nombre;
  document.getElementById('cursoDesc').value = item.descripcion || '';
  document.getElementById('cursoHoras').value = item.horas;
  document.getElementById('cursoInstructorId').value = item.instructorId || '';
  document.getElementById('cursoEstado').value = item.estado || 'Disponible';

  openModal('modalCurso');
}

// Guardar Instructor
async function saveInstructor(e) {
  e.preventDefault();
  const id = document.getElementById('instructorId').value;
  const data = {
    documento: document.getElementById('instDoc').value.trim(),
    nombres: document.getElementById('instNombres').value.trim(),
    apellidos: document.getElementById('instApellidos').value.trim(),
    correo: document.getElementById('instCorreo').value.trim(),
    especialidad: document.getElementById('instEspecialidad').value.trim(),
    estado: true
  };

  try {
    if (id) {
      await apiRequest(`/instructores/${id}`, 'PUT', data);
      showToast('Instructor modificado', 'success');
    } else {
      await apiRequest('/instructores', 'POST', data);
      showToast('Instructor registrado exitosamente', 'success');
    }
    closeModal('modalInstructor');
    await fetchAllData();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

function editInstructor(id) {
  const item = state.instructores.find(i => String(i.id) === String(id));
  if (!item) return;

  document.getElementById('modalInstructorTitle').textContent = 'Editar Instructor';
  document.getElementById('instructorId').value = item.id;
  document.getElementById('instDoc').value = item.documento;
  document.getElementById('instNombres').value = item.nombres;
  document.getElementById('instApellidos').value = item.apellidos;
  document.getElementById('instCorreo').value = item.correo;
  document.getElementById('instEspecialidad').value = item.especialidad;

  openModal('modalInstructor');
}

// Guardar Matrícula
async function saveMatricula(e) {
  e.preventDefault();
  const rawApId = document.getElementById('matAprendizId').value;
  const rawCurId = document.getElementById('matCursoId').value;
  const data = {
    aprendizId: isNaN(rawApId) ? rawApId : Number(rawApId),
    cursoId: isNaN(rawCurId) ? rawCurId : Number(rawCurId),
    fechaMatricula: document.getElementById('matFecha').value,
    estado: document.getElementById('matEstado').value
  };

  try {
    await apiRequest('/matriculas', 'POST', data);
    showToast('Matrícula registrada exitosamente', 'success');
    closeModal('modalMatricula');
    await fetchAllData();
  } catch (err) {
    showToast(`Error al matricular: ${err.message}`, 'error');
  }
}

// Modal Calificación
function openModalCalificacion(matriculaId, apNombre, cursoNombre) {
  document.getElementById('califMatriculaId').value = matriculaId;
  document.getElementById('califInfoDesc').textContent = `Aprendiz: ${apNombre} | Curso: ${cursoNombre}`;

  // Verificar si ya tiene nota
  const existing = state.calificaciones.find(q => String(q.matriculaId) === String(matriculaId));
  if (existing) {
    document.getElementById('califId').value = existing.id;
    document.getElementById('califNota').value = existing.nota;
    document.getElementById('califFecha').value = existing.fecha || new Date().toISOString().split('T')[0];
    document.getElementById('califObservacion').value = existing.observacion || '';
    document.getElementById('modalCalifTitle').textContent = 'Modificar Calificación';
  } else {
    document.getElementById('califId').value = '';
    document.getElementById('califNota').value = '';
    document.getElementById('califFecha').value = new Date().toISOString().split('T')[0];
    document.getElementById('califObservacion').value = '';
    document.getElementById('modalCalifTitle').textContent = 'Asignar Calificación';
  }

  openModal('modalCalificacion');
}

async function saveCalificacion(e) {
  e.preventDefault();
  const rawMatId = document.getElementById('califMatriculaId').value;
  const id = document.getElementById('califId').value;
  const data = {
    matriculaId: isNaN(rawMatId) ? rawMatId : Number(rawMatId),
    nota: parseFloat(document.getElementById('califNota').value),
    observacion: document.getElementById('califObservacion').value.trim(),
    fecha: document.getElementById('califFecha').value
  };

  try {
    if (id) {
      await apiRequest(`/calificaciones/${id}`, 'PUT', data);
      showToast('Calificación actualizada', 'success');
    } else {
      await apiRequest('/calificaciones', 'POST', data);
      showToast('Calificación registrada', 'success');
    }
    closeModal('modalCalificacion');
    await fetchAllData();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

// Eliminar Registro Genérico
async function deleteRecord(resource, id) {
  if (!confirm(`¿Estás seguro de eliminar este registro (#${id}) de ${resource}?`)) {
    return;
  }

  try {
    await apiRequest(`/${resource}/${id}`, 'DELETE');
    showToast(`Registro eliminado del JSON`, 'success');
    await fetchAllData();
  } catch (err) {
    showToast(`Error al eliminar: ${err.message}`, 'error');
  }
}

// Helper genérico para peticiones fetch
async function apiRequest(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, options);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Código ${res.status}: ${errorText || res.statusText}`);
  }
  return method === 'DELETE' ? null : await res.json();
}

// ==================== MODALES & TOASTS ====================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add('open');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('open');

  // Limpiar formularios al cerrar si es creación
  const form = modal.querySelector('form');
  if (form) {
    form.reset();
    const hiddenId = form.querySelector('input[type="hidden"]');
    if (hiddenId) hiddenId.value = '';
  }

  // Restaurar títulos
  const titles = {
    modalAprendiz: 'Registrar Nuevo Aprendiz',
    modalPrograma: 'Nuevo Programa',
    modalCurso: 'Nuevo Curso',
    modalInstructor: 'Nuevo Instructor',
    modalCalificacion: 'Asignar Calificación'
  };
  const titleEl = modal.querySelector('.modal-header h3');
  if (titleEl && titles[modalId]) titleEl.textContent = titles[modalId];
}

// Cerrar modal al hacer click fuera
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.2s';
    setTimeout(() => toast.remove(), 200);
  }, 3500);
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
