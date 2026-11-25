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
  startClock();
  fetchAllData();
  initDefaultEditorTemplate();

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
  renderCalificaciones();
  populateSelects();
  fetchViewerData();
}

function updateBadges() {
  const elAp = document.getElementById('countBadgeAprendices');
  const elProg = document.getElementById('countBadgeProgramas');
  const elCur = document.getElementById('countBadgeCursos');
  const elInst = document.getElementById('countBadgeInstructores');
  const elMat = document.getElementById('countBadgeMatriculas');
  const elCal = document.getElementById('countBadgeCalificaciones');

  if (elAp) elAp.textContent = state.aprendices.length;
  if (elProg) elProg.textContent = state.programas.length;
  if (elCur) elCur.textContent = state.cursos.length;
  if (elInst) elInst.textContent = state.instructores.length;
  if (elMat) elMat.textContent = state.matriculas.length;
  if (elCal) elCal.textContent = state.calificaciones.length;

  const statAp = document.getElementById('statAprendices');
  const statProg = document.getElementById('statProgramas');
  const statCur = document.getElementById('statCursos');
  const statInst = document.getElementById('statInstructores');

  if (statAp) statAp.textContent = state.aprendices.length;
  if (statProg) statProg.textContent = state.programas.length;
  if (statCur) statCur.textContent = state.cursos.length;
  if (statInst) statInst.textContent = state.instructores.length;
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

// Renderizado Calificaciones
function renderCalificaciones() {
  const tbody = document.getElementById('tbodyCalificaciones');
  if (!tbody) return;

  if (state.calificaciones.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No hay calificaciones registradas.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.calificaciones.map(cal => {
    const mat = state.matriculas.find(m => String(m.id) === String(cal.matriculaId));
    let aprendizNombre = 'N/A';
    let cursoNombre = 'N/A';

    if (mat) {
      const ap = state.aprendices.find(a => String(a.id) === String(mat.aprendizId));
      const cur = state.cursos.find(c => String(c.id) === String(mat.cursoId));
      if (ap) aprendizNombre = `${ap.nombres} ${ap.apellidos}`;
      if (cur) cursoNombre = cur.nombre;
    }

    return `
      <tr>
        <td>#${cal.id}</td>
        <td><strong>${escapeHtml(aprendizNombre)}</strong></td>
        <td>${escapeHtml(cursoNombre)}</td>
        <td><strong style="color: ${cal.nota >= 3.0 ? '#059669' : '#dc2626'}">${cal.nota}</strong></td>
        <td>${escapeHtml(cal.observacion || '-')}</td>
        <td>${cal.fecha || '-'}</td>
        <td style="text-align: right;">
          <button class="btn btn-secondary btn-sm" onclick="openModalCalificacion('${cal.matriculaId}', '${escapeHtml(aprendizNombre)}', '${escapeHtml(cursoNombre)}')">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="deleteRecord('calificaciones', '${cal.id}')">Eliminar</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ==================== CENTRO JSON (ALIMENTAR Y RECIBIR) ====================

let lastViewedData = null;

// Reloj dinámico
function startClock() {
  function updateTime() {
    const el = document.getElementById('clockUpdated');
    if (el) {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      el.textContent = `Actualizado ${timeStr}`;
    }
  }
  updateTime();
  setInterval(updateTime, 1000);
}

// Recargar Centro JSON
function reloadJsonCenter() {
  showToast('Recargando datos JSON del servidor...', 'info');
  fetchAllData();
}

// Consultar y mostrar datos en el visor JSON izquierdo
async function fetchViewerData() {
  const endpointEl = document.getElementById('viewerEndpoint');
  const filterEl = document.getElementById('viewerFilter');
  const displayEl = document.getElementById('jsonViewerDisplay');
  if (!endpointEl || !displayEl) return;

  const endpoint = endpointEl.value;
  const filter = filterEl ? filterEl.value.trim() : '';

  try {
    let data;
    if (endpoint === 'all') {
      data = {
        programas: state.programas,
        aprendices: state.aprendices,
        instructores: state.instructores,
        cursos: state.cursos,
        matriculas: state.matriculas,
        calificaciones: state.calificaciones
      };
    } else {
      let url = `${API_BASE}/${endpoint}`;
      if (filter) {
        url += filter.startsWith('?') ? filter : `?${filter}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      data = await res.json();
    }

    lastViewedData = data;
    displayEl.innerHTML = syntaxHighlightJson(data);
  } catch (err) {
    displayEl.textContent = `// Error al consultar JSON: ${err.message}`;
  }
}

// Resaltador de sintaxis JSON
function syntaxHighlightJson(json) {
  if (typeof json !== 'string') {
    json = JSON.stringify(json, null, 2);
  }
  json = escapeHtml(json);
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = 'json-number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'json-key';
      } else {
        cls = 'json-string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'json-boolean';
    } else if (/null/.test(match)) {
      cls = 'json-null';
    }
    return `<span class="${cls}">${match}</span>`;
  });
}

// Copiar JSON del visor
function copyViewerJson() {
  if (!lastViewedData) {
    showToast('No hay datos para copiar', 'error');
    return;
  }
  const text = JSON.stringify(lastViewedData, null, 2);
  navigator.clipboard.writeText(text).then(() => {
    showToast('¡JSON copiado al portapapeles!', 'success');
  }).catch(() => {
    showToast('No se pudo copiar al portapapeles', 'error');
  });
}

// Descargar JSON del visor
function downloadViewerJson() {
  if (!lastViewedData) return;
  const endpoint = document.getElementById('viewerEndpoint').value;
  const filename = endpoint === 'all' ? 'message.json' : `${endpoint}.json`;
  triggerDownload(lastViewedData, filename);
}

// Descargar JSON completo
function downloadCurrentJson() {
  const fullData = {
    programas: state.programas,
    aprendices: state.aprendices,
    instructores: state.instructores,
    cursos: state.cursos,
    matriculas: state.matriculas,
    calificaciones: state.calificaciones
  };
  triggerDownload(fullData, 'message.json');
}

function triggerDownload(data, filename) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Descargando ${filename}`, 'info');
}

// Cargar toda la base de datos actual al editor derecho
function loadDbIntoEditor() {
  const target = document.getElementById('feedTarget').value;
  let data;
  if (target === 'root') {
    data = {
      programas: state.programas,
      aprendices: state.aprendices,
      instructores: state.instructores,
      cursos: state.cursos,
      matriculas: state.matriculas,
      calificaciones: state.calificaciones
    };
  } else {
    data = state[target] || [];
  }
  document.getElementById('jsonEditor').value = JSON.stringify(data, null, 2);
  showToast(`Datos de ${target} cargados al editor`, 'success');
}

// Formatear JSON del editor
function formatEditorJson() {
  const editor = document.getElementById('jsonEditor');
  if (!editor || !editor.value.trim()) return;
  try {
    const parsed = JSON.parse(editor.value);
    editor.value = JSON.stringify(parsed, null, 2);
    showToast('JSON formateado correctamente', 'success');
  } catch (err) {
    showToast(`Error de sintaxis JSON: ${err.message}`, 'error');
  }
}

// Limpiar editor
function clearEditorJson() {
  const editor = document.getElementById('jsonEditor');
  if (editor) editor.value = '';
}

// Cargar archivo local al editor
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      document.getElementById('jsonEditor').value = JSON.stringify(parsed, null, 2);
      showToast(`Archivo "${file.name}" cargado`, 'success');
    } catch (err) {
      showToast(`El archivo no contiene un JSON válido: ${err.message}`, 'error');
    }
  };
  reader.readAsText(file);
}

// Plantillas predefinidas
const TEMPLATES = {
  aprendices: {
    target: 'aprendices',
    data: [
      {
        documento: "1004567890",
        nombres: "Sofía",
        apellidos: "Castro Vargas",
        correo: "sofia.castro@example.com",
        telefono: "3157778899",
        fechaNacimiento: "2004-03-22",
        ciudad: "Neiva",
        estado: "Activo"
      }
    ]
  },
  programas: {
    target: 'programas',
    data: [
      {
        nombre: "Inteligencia Artificial y Ciencia de Datos",
        codigo: "IACD",
        nivel: "Tecnólogo",
        duracion: 24,
        estado: true
      }
    ]
  },
  cursos: {
    target: 'cursos',
    data: [
      {
        nombre: "Desarrollo con Python y FastAPI",
        descripcion: "Construcción de APIs modernas y de alto rendimiento",
        horas: 40,
        instructorId: 1,
        estado: "Disponible"
      }
    ]
  },
  matriculas: {
    target: 'matriculas',
    data: [
      {
        aprendizId: 1,
        cursoId: 2,
        fechaMatricula: new Date().toISOString().split('T')[0],
        estado: "Matriculado"
      }
    ]
  },
  calificaciones: {
    target: 'calificaciones',
    data: [
      {
        matriculaId: 1,
        nota: 4.8,
        observacion: "Excelente rendimiento y entrega puntual",
        fecha: new Date().toISOString().split('T')[0]
      }
    ]
  }
};

function loadTemplate(type) {
  const tpl = TEMPLATES[type];
  if (!tpl) return;
  const targetSelect = document.getElementById('feedTarget');
  if (targetSelect) targetSelect.value = tpl.target;

  const payload = {};
  payload[tpl.target] = tpl.data;

  document.getElementById('jsonEditor').value = JSON.stringify(payload, null, 2);
  showToast(`Plantilla de ${type} cargada`, 'info');
}

function initDefaultEditorTemplate() {
  const editor = document.getElementById('jsonEditor');
  if (editor && !editor.value.trim()) {
    loadTemplate('aprendices');
  }
}

// Enviar / Alimentar el servidor con el JSON del editor
async function submitFeedJson() {
  const editor = document.getElementById('jsonEditor');
  if (!editor || !editor.value.trim()) {
    showToast('El editor JSON está vacío', 'error');
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(editor.value);
  } catch (err) {
    showToast(`JSON inválido: ${err.message}`, 'error');
    return;
  }

  const target = document.getElementById('feedTarget').value;
  let itemsCount = 0;

  showToast('Alimentando servidor con datos JSON...', 'info');

  try {
    if (target === 'root') {
      // Objeto raíz: ej: { "aprendices": [...], "cursos": [...] }
      for (const [key, items] of Object.entries(parsed)) {
        if (Array.isArray(items)) {
          for (const item of items) {
            await apiRequest(`/${key}`, 'POST', item);
            itemsCount++;
          }
        } else if (typeof items === 'object' && items !== null) {
          await apiRequest(`/${key}`, 'POST', items);
          itemsCount++;
        }
      }
    } else {
      // Endpoint específico
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          await apiRequest(`/${target}`, 'POST', item);
          itemsCount++;
        }
      } else if (parsed[target] && Array.isArray(parsed[target])) {
        for (const item of parsed[target]) {
          await apiRequest(`/${target}`, 'POST', item);
          itemsCount++;
        }
      } else {
        await apiRequest(`/${target}`, 'POST', parsed);
        itemsCount++;
      }
    }

    showToast(`¡Éxito! Se alimentaron ${itemsCount} registros a message.json`, 'success');
    await fetchAllData();
  } catch (err) {
    showToast(`Error al alimentar servidor: ${err.message}`, 'error');
  }
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
