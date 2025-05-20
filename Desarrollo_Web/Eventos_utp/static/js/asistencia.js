document.addEventListener('DOMContentLoaded', function () {
    const botonInterruptorMenu = document.getElementById('interruptorMenu');
    const elementoBarraLateral = document.getElementById('barraLateral');

    if (botonInterruptorMenu && elementoBarraLateral) {
        botonInterruptorMenu.addEventListener('click', function () {
            elementoBarraLateral.classList.toggle('abierto');
            botonInterruptorMenu.classList.toggle('activo');
            const estaBarraAbierta = elementoBarraLateral.classList.contains('abierto');
            botonInterruptorMenu.setAttribute('aria-expanded', estaBarraAbierta.toString());
            document.body.classList.toggle('barra-lateral-abierta', estaBarraAbierta);
        });
    }
    document.addEventListener('click', function (eventoDeClic) {
        if (elementoBarraLateral && botonInterruptorMenu &&
            elementoBarraLateral.classList.contains('abierto') &&
            !elementoBarraLateral.contains(eventoDeClic.target) &&
            !botonInterruptorMenu.contains(eventoDeClic.target)) {
            elementoBarraLateral.classList.remove('abierto');
            botonInterruptorMenu.classList.remove('activo');
            botonInterruptorMenu.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('barra-lateral-abierta');
        }
    });

    // --- ELEMENTOS DEL DOM PARA ASISTENCIA ---
    const formularioRegistroAsistencia = document.getElementById('formularioRegistroAsistencia');
    const selectApoyo = document.getElementById('apoyoAsistencia');
    const selectColegio = document.getElementById('colegioAsistencia');
    const infoColegioDiv = document.getElementById('infoColegioSeleccionado');
    const selectRol = document.getElementById('rolAsistencia');
    const selectTurno = document.getElementById('turnoAsistencia');
    const inputFecha = document.getElementById('fechaAsistencia');
    const btnLimpiarFormulario = document.getElementById('btnLimpiarFormularioAsistencia');
    const idAsistenciaEditarInput = document.getElementById('idAsistenciaEditar');

    const cuerpoTablaAsistenciasPlanificadas = document.getElementById('cuerpoTablaAsistenciasPlanificadas');
    const campoBusquedaAsistenciaPlanificada = document.getElementById('campoBusquedaAsistenciaPlanificada');

    // --- DATOS Y ESTADO ---
    let listaDeApoyosGlobal = [];
    let listaDeColegiosGlobal = [];
    let listaDePromotoresGlobal = [];

    let listaAsistenciasPlanificadas = [];
    try {
        const rawPlanificadas = localStorage.getItem('listaAsistenciasPlanificadasUTP');
        if (rawPlanificadas) listaAsistenciasPlanificadas = JSON.parse(rawPlanificadas);
        if (!Array.isArray(listaAsistenciasPlanificadas)) listaAsistenciasPlanificadas = [];
    } catch (e) {
        console.error("Error al cargar listaAsistenciasPlanificadasUTP:", e);
        listaAsistenciasPlanificadas = [];
    }

    let listaAsistenciasConfirmadas = [];
    try {
        const rawConfirmadas = localStorage.getItem('listaAsistenciasConfirmadasUTP');
        if (rawConfirmadas) listaAsistenciasConfirmadas = JSON.parse(rawConfirmadas);
        if (!Array.isArray(listaAsistenciasConfirmadas)) listaAsistenciasConfirmadas = [];
    } catch (e) {
        console.error("Error al cargar listaAsistenciasConfirmadasUTP:", e);
        listaAsistenciasConfirmadas = [];
    }


    let proximoIdAsistenciaPlanificada = listaAsistenciasPlanificadas.length > 0 ? Math.max(0, ...listaAsistenciasPlanificadas.map(a => a.id)) + 1 : 1;
    let idAsistenciaEnEdicion = null;

    const PAGO_ROL_BUS = 50;
    const PAGO_ROL_CAMPUS = 40;
    const PAGO_CANCELADO = 20;

    // --- Ionos ---
    const svgIconoEditar = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M5 18.89H6.41421L15.7279 9.57629L14.3137 8.16207L5 17.4758V18.89ZM21 11.1621L12.7279 2.89H11.3137L2.46447 11.7376C2.17157 12.0305 2 12.4369 2 12.8625V18.89C2 19.4423 2.44772 19.89 3 19.89H9.02754C9.45312 19.89 9.85953 19.7184 10.1524 19.4255L18.4246 11.1534L19.8388 12.5676L18.8476 13.5588L19.5547 14.2659L21.2929 12.5278C21.6834 12.1373 21.6834 11.5041 21.2929 11.1136L19.8787 9.70001L21 8.57871V11.1621Z"></path></svg>';
    const svgIconoEliminar = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 6V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7ZM9 4V6H15V4H9Z"></path></svg>';

    // --- RENDERIZAR TABLA DE ASISTENCIAS PLANIFICADAS ---
    function renderizarTablaAsistenciasPlanificadas(filtrados = listaAsistenciasPlanificadas) {
        if (!cuerpoTablaAsistenciasPlanificadas) return;
        cuerpoTablaAsistenciasPlanificadas.innerHTML = '';

        if (filtrados.length === 0) {
            const filaVacia = cuerpoTablaAsistenciasPlanificadas.insertRow();
            const celdaVacia = filaVacia.insertCell();
            celdaVacia.colSpan = 6;
            celdaVacia.textContent = 'No hay asistencias planificadas o que coincidan con la búsqueda.';
            celdaVacia.style.textAlign = 'center';
            celdaVacia.style.padding = '20px';
            return;
        }

        filtrados.forEach(asistencia => {
            const apoyo = listaDeApoyosGlobal.find(a => a.id === asistencia.apoyoId); 
            const colegio = listaDeColegiosGlobal.find(c => c.id === asistencia.colegioId);

            if (!apoyo || !colegio) {
                console.warn("ASISTENCIA.JS - No se encontró apoyo o colegio para la asistencia ID:", asistencia.id, "ApoyoID:", asistencia.apoyoId, "ColegioID:", asistencia.colegioId);
                return;
            }

            const fila = cuerpoTablaAsistenciasPlanificadas.insertRow();
            fila.insertCell().textContent = `${apoyo.apellidos}, ${apoyo.nombres}`;
            fila.insertCell().textContent = asistencia.rol.charAt(0).toUpperCase() + asistencia.rol.slice(1);
            fila.insertCell().textContent = asistencia.turno.charAt(0).toUpperCase() + asistencia.turno.slice(1);
            fila.insertCell().textContent = colegio.nombre;
            try {
                
                const fechaObj = new Date(asistencia.fecha + 'T00:00:00'); 
                if (isNaN(fechaObj)) throw new Error("Fecha inválida");
                fila.insertCell().textContent = fechaObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
            } catch (e) {
                console.error("ASISTENCIA.JS - Error formateando fecha:", asistencia.fecha, e);
                fila.insertCell().textContent = asistencia.fecha; 
            }

            const celdaAcciones = fila.insertCell();

            const botonEditar = document.createElement('button');
            botonEditar.innerHTML = `${svgIconoEditar} Editar Plan.`;
            botonEditar.classList.add('boton-accion', 'boton-editar');
            botonEditar.title = "Editar datos de la planificación";
            botonEditar.addEventListener('click', () => cargarPlanificacionParaEditar(asistencia));
            celdaAcciones.appendChild(botonEditar);

            const botonEliminar = document.createElement('button');
            botonEliminar.innerHTML = `${svgIconoEliminar} Eliminar Plan.`;
            botonEliminar.classList.add('boton-accion', 'boton-eliminar');
            botonEliminar.title = "Eliminar esta planificación";
            botonEliminar.addEventListener('click', () => eliminarPlanificacion(asistencia.id));
            celdaAcciones.appendChild(botonEliminar);

            const botonAsistio = document.createElement('button');
            botonAsistio.textContent = 'Asistió';
            botonAsistio.classList.add('boton-accion', 'asistio-btn');
            botonAsistio.addEventListener('click', () => confirmarAsistencia(asistencia.id, 'asistio'));
            celdaAcciones.appendChild(botonAsistio);

            const botonCancelo = document.createElement('button');
            botonCancelo.textContent = 'Canceló';
            botonCancelo.classList.add('boton-accion', 'cancelo-btn');
            botonCancelo.addEventListener('click', () => confirmarAsistencia(asistencia.id, 'cancelado'));
            celdaAcciones.appendChild(botonCancelo);
        });
    }

    // --- FUNCIONES DE CARGA DE DATOS INICIALES ---
    function cargarDatosDesdeLocalStorage() {
        try {
            const rawApoyos = localStorage.getItem('listaDeApoyosUTP');
            if (rawApoyos) listaDeApoyosGlobal = JSON.parse(rawApoyos);
            if (!Array.isArray(listaDeApoyosGlobal)) listaDeApoyosGlobal = [];
        } catch (e) { console.error("ASISTENCIA.JS - Error al cargar listaDeApoyosUTP:", e); listaDeApoyosGlobal = []; }

        try {
            const rawColegios = localStorage.getItem('listaDeColegiosUTP');
            if (rawColegios) listaDeColegiosGlobal = JSON.parse(rawColegios);
            if (!Array.isArray(listaDeColegiosGlobal)) listaDeColegiosGlobal = [];
        } catch (e) { console.error("ASISTENCIA.JS - Error al cargar listaDeColegiosUTP:", e); listaDeColegiosGlobal = []; }

        try {
            const rawPromotores = localStorage.getItem('listaDePromotoresUTP');
            if (rawPromotores) listaDePromotoresGlobal = JSON.parse(rawPromotores);
            if (!Array.isArray(listaDePromotoresGlobal)) listaDePromotoresGlobal = [];
        } catch (e) { console.error("ASISTENCIA.JS - Error al cargar listaDePromotoresUTP:", e); listaDePromotoresGlobal = []; }
    }

    function popularSelectApoyos() {
        if (!selectApoyo) return;
        selectApoyo.innerHTML = '<option value="">Seleccione un Apoyo...</option>';
        listaDeApoyosGlobal.forEach(apoyo => {
            const option = document.createElement('option');
            option.value = apoyo.id; 
            option.textContent = `${apoyo.apellidos}, ${apoyo.nombres} (DNI: ${apoyo.dni})`;
            selectApoyo.appendChild(option);
        });
        if (listaDeApoyosGlobal.length === 0) {
            selectApoyo.innerHTML = '<option value="" disabled>No hay apoyos registrados</option>';
        }
    }

    function popularSelectColegios() {
        if (!selectColegio) return;
        selectColegio.innerHTML = '<option value="">Seleccione un Colegio...</option>';
        listaDeColegiosGlobal.forEach(colegio => {
            const option = document.createElement('option');
            option.value = colegio.id;
            option.textContent = colegio.nombre;
            selectColegio.appendChild(option);
        });
        if (listaDeColegiosGlobal.length === 0) {
            selectColegio.innerHTML = '<option value="" disabled>No hay colegios registrados</option>';
        }
    }

    // --- MOSTRAR INFO DEL COLEGIO SELECCIONADO ---
    if (selectColegio) {
        selectColegio.addEventListener('change', function () {
            const colegioId = this.value; 
            infoColegioDiv.innerHTML = '';
            infoColegioDiv.style.display = 'none';

            if (!colegioId) return;

            const colegioSeleccionado = listaDeColegiosGlobal.find(c => c.id.toString() === colegioId);
            if (colegioSeleccionado) {
                let promotorInfoHtml = 'Promotor no asignado o no encontrado.';
                if (colegioSeleccionado.promotorId) {
                    const promotor = listaDePromotoresGlobal.find(p => p.id.toString() === colegioSeleccionado.promotorId.toString());
                    if (promotor) {
                        promotorInfoHtml = `<b>Promotor:</b> ${promotor.apellidos}, ${promotor.nombres} (Código: ${promotor.codigo}, Correo: ${promotor.correo})`;
                    }
                }

                infoColegioDiv.innerHTML = `
                    <p>${promotorInfoHtml}</p>
                    <p><b>Encargado Colegio:</b> ${colegioSeleccionado.nombreEncargado} ${colegioSeleccionado.apellidosEncargado} (Tel: ${colegioSeleccionado.telefonoEncargado})</p>
                    ${colegioSeleccionado.linkUbicacion ? `<p><b>Ubicación:</b> <a href="${colegioSeleccionado.linkUbicacion}" target="_blank" rel="noopener noreferrer">Ver Mapa</a></p>` : ''}
                    ${colegioSeleccionado.nombreArchivoBd ? `<p><b>Base de Datos:</b> ${colegioSeleccionado.nombreArchivoBd}</p>` : ''}
                `;
                infoColegioDiv.style.display = 'block';
            }
        });
    }

    // --- GUARDAR LISTAS EN LOCAL ---
    function guardarAsistenciasPlanificadas() {
        try {
            localStorage.setItem('listaAsistenciasPlanificadasUTP', JSON.stringify(listaAsistenciasPlanificadas));
        } catch (e) {
            console.error("ASISTENCIA.JS - Error guardando listaAsistenciasPlanificadasUTP:", e);
        }
    }
    function guardarAsistenciasConfirmadas() {
        try {
            console.log("ASISTENCIA.JS - Guardando listaAsistenciasConfirmadasUTP en localStorage:", JSON.stringify(listaAsistenciasConfirmadas));
            localStorage.setItem('listaAsistenciasConfirmadasUTP', JSON.stringify(listaAsistenciasConfirmadas));
        } catch (e) {
            console.error("ASISTENCIA.JS - Error guardando listaAsistenciasConfirmadasUTP:", e);
        }
    }

    // --- LÓGICA DEL FORMULARIO DE PLANIFICACIÓN ---
    function limpiarFormulario() {
        if (formularioRegistroAsistencia) formularioRegistroAsistencia.reset();
        if (infoColegioDiv) {
            infoColegioDiv.innerHTML = '';
            infoColegioDiv.style.display = 'none';
        }
        if (idAsistenciaEditarInput) idAsistenciaEditarInput.value = '';
        idAsistenciaEnEdicion = null;
        if (selectApoyo) selectApoyo.disabled = false;
        if (formularioRegistroAsistencia) {
            const tituloForm = formularioRegistroAsistencia.querySelector('h2');
            if (tituloForm) tituloForm.textContent = "Planificar Nueva Asistencia";
        }
    }

    if (btnLimpiarFormulario) {
        btnLimpiarFormulario.addEventListener('click', limpiarFormulario);
    }

    if (formularioRegistroAsistencia) {
        formularioRegistroAsistencia.addEventListener('submit', function (evento) {
            evento.preventDefault();

            const apoyoId = parseInt(selectApoyo.value); 
            const colegioId = parseInt(selectColegio.value);
            const rol = selectRol.value;
            const turno = selectTurno.value;
            const fecha = inputFecha.value;

            if (!apoyoId || !colegioId || !rol || !turno || !fecha) {
                alert('Por favor, complete todos los campos para planificar la asistencia.');
                return;
            }

            const asistenciaPlanificadaData = {
                apoyoId: apoyoId,
                colegioId: colegioId, 
                rol,
                turno,
                fecha,
            };

            if (idAsistenciaEnEdicion !== null) { 
                const index = listaAsistenciasPlanificadas.findIndex(a => a.id === idAsistenciaEnEdicion);
                if (index !== -1) {
                    listaAsistenciasPlanificadas[index] = { ...listaAsistenciasPlanificadas[index], ...asistenciaPlanificadaData };
                }
            } else {
                const yaPlanificado = listaAsistenciasPlanificadas.find(
                    a => a.apoyoId === asistenciaPlanificadaData.apoyoId &&
                        a.fecha === asistenciaPlanificadaData.fecha &&
                        a.turno === asistenciaPlanificadaData.turno
                );
                if (yaPlanificado) {
                    alert('Este apoyo ya tiene una asistencia planificada para la misma fecha y turno.');
                    return;
                }
                asistenciaPlanificadaData.id = proximoIdAsistenciaPlanificada++; 
                listaAsistenciasPlanificadas.push(asistenciaPlanificadaData);
            }

            guardarAsistenciasPlanificadas();
            renderizarTablaAsistenciasPlanificadas();
            limpiarFormulario();
        });
    }

    // --- ACCIONES DE LA TABLA DE PLANIFICADAS ---
    function cargarPlanificacionParaEditar(asistencia) {
        limpiarFormulario();
        idAsistenciaEnEdicion = asistencia.id;
        if (idAsistenciaEditarInput) idAsistenciaEditarInput.value = asistencia.id.toString();

        selectApoyo.value = asistencia.apoyoId.toString();
        selectColegio.value = asistencia.colegioId.toString();
        selectRol.value = asistencia.rol;
        selectTurno.value = asistencia.turno;
        inputFecha.value = asistencia.fecha;

        const event = new Event('change', { bubbles: true });
        selectColegio.dispatchEvent(event);

        const tituloForm = formularioRegistroAsistencia.querySelector('h2');
        if (tituloForm) tituloForm.textContent = "Editando Planificación de Asistencia";
        formularioRegistroAsistencia.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function eliminarPlanificacion(idAsistencia) { 
        if (confirm('¿Está seguro de eliminar esta planificación de asistencia?')) {
            listaAsistenciasPlanificadas = listaAsistenciasPlanificadas.filter(a => a.id !== idAsistencia);
            guardarAsistenciasPlanificadas();
            renderizarTablaAsistenciasPlanificadas();
        }
    }

    function confirmarAsistencia(idPlanificacion, estado) { 
        const planificacionIndex = listaAsistenciasPlanificadas.findIndex(a => a.id === idPlanificacion);
        if (planificacionIndex === -1) {
            console.error("ASISTENCIA.JS - No se encontró la planificación con ID:", idPlanificacion);
            alert('No se encontró la planificación.');
            return;
        }
        const planificacion = listaAsistenciasPlanificadas[planificacionIndex]; 

        const apoyo = listaDeApoyosGlobal.find(a => a.id === planificacion.apoyoId);
        const colegio = listaDeColegiosGlobal.find(c => c.id === planificacion.colegioId);
        let promotor = null;
        if (colegio && colegio.promotorId) {
            promotor = listaDePromotoresGlobal.find(p => p.id.toString() === colegio.promotorId.toString());
        }

        if (!apoyo || !colegio) {
            console.error("ASISTENCIA.JS - Error: No se encontró el apoyo o colegio asociado para la planificación ID:", idPlanificacion);
            alert('Error: No se encontró el apoyo o colegio asociado.');
            return;
        }

        let pagoCalculado = 0;
        if (estado === 'asistio') {
            pagoCalculado = planificacion.rol === 'bus' ? PAGO_ROL_BUS : PAGO_ROL_CAMPUS;
        } else if (estado === 'cancelado') {
            pagoCalculado = PAGO_CANCELADO;
        }

        const asistenciaConfirmada = {
            idOriginalPlanificacion: planificacion.id, 
            apoyoInfo: {
                id: apoyo.id, 
                nombreCompleto: `${apoyo.apellidos}, ${apoyo.nombres}`,
                dni: apoyo.dni,
                ruc: apoyo.ruc,
                correo: apoyo.correo
            },
            colegioInfo: {
                id: colegio.id, 
                nombre: colegio.nombre,
                promotor: promotor ? { codigo: promotor.codigo, correo: promotor.correo, nombreCompleto: `${promotor.apellidos}, ${promotor.nombres}` } : { nombreCompleto: "No asignado" },
                encargado: `${colegio.nombreEncargado} ${colegio.apellidosEncargado}`,
                telefonoEncargado: colegio.telefonoEncargado,
                linkUbicacion: colegio.linkUbicacion,
                nombreArchivoBd: colegio.nombreArchivoBd
            },
            rol: planificacion.rol,
            turno: planificacion.turno,
            fecha: planificacion.fecha, 
            estadoAsistencia: estado,
            pagoCalculado: pagoCalculado, 
            fechaConfirmacion: new Date().toISOString() 
        };
        console.log("ASISTENCIA.JS - Objeto asistenciaConfirmada a punto de ser añadido:", asistenciaConfirmada);

        listaAsistenciasConfirmadas.push(asistenciaConfirmada);
        guardarAsistenciasConfirmadas();

        listaAsistenciasPlanificadas.splice(planificacionIndex, 1);
        guardarAsistenciasPlanificadas();
        renderizarTablaAsistenciasPlanificadas();

        alert(`Asistencia marcada como "${estado}" para ${apoyo.nombres} ${apoyo.apellidos}. Pago: S/ ${pagoCalculado.toFixed(2)}`);
    }

    // --- BÚSQUEDA EN TABLA DE PLANIFICADAS ---
    if (campoBusquedaAsistenciaPlanificada) {
        campoBusquedaAsistenciaPlanificada.addEventListener('input', function (e) {
            const termino = e.target.value.toLowerCase().trim();
            const filtrados = listaAsistenciasPlanificadas.filter(asistencia => {
                const apoyo = listaDeApoyosGlobal.find(a => a.id === asistencia.apoyoId);
                const colegio = listaDeColegiosGlobal.find(c => c.id === asistencia.colegioId);
                if (!apoyo || !colegio) return false;

                const nombreApoyo = `${apoyo.apellidos} ${apoyo.nombres}`.toLowerCase();
                const nombreColegio = colegio.nombre.toLowerCase();
                let fechaStr = asistencia.fecha;
                try {
                    const fechaObj = new Date(asistencia.fecha + 'T00:00:00');
                    if (!isNaN(fechaObj)) {
                        fechaStr = fechaObj.toLocaleDateString('es-ES').toLowerCase();
                    }
                } catch (error) { /* Mantener fecha original si no es válida */ }

                return nombreApoyo.includes(termino) ||
                    nombreColegio.includes(termino) ||
                    asistencia.rol.toLowerCase().includes(termino) ||
                    asistencia.turno.toLowerCase().includes(termino) ||
                    fechaStr.includes(termino);
            });
            renderizarTablaAsistenciasPlanificadas(filtrados);
        });
    }

    // --- INICIALIZACIÓN ---
    cargarDatosDesdeLocalStorage();
    popularSelectApoyos();
    popularSelectColegios();
    renderizarTablaAsistenciasPlanificadas();
    limpiarFormulario();
});