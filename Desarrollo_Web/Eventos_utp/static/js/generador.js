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

    // --- ELEMENTOS DEL DOM ---
    const selectApoyoParaOC = document.getElementById('selectApoyoParaOC');
    const seccionAsistenciasPendientes = document.getElementById('seccionAsistenciasPendientes');
    const listaAsistenciasParaSeleccionar = document.getElementById('listaAsistenciasParaSeleccionar');
    const seccionResumenOC = document.getElementById('seccionResumenOC');
    const cuerpoTablaResumenPago = document.getElementById('cuerpoTablaResumenPago');
    const totalAPagarOC = document.getElementById('totalAPagarOC');
    const btnGenerarDocumentos = document.getElementById('btnGenerarDocumentos');
    const campoBusquedaOCGeneradas = document.getElementById('campoBusquedaOCGeneradas');
    const cuerpoTablaOCGeneradas = document.getElementById('cuerpoTablaOCGeneradas');

    const modalVisualizador = document.getElementById('modalVisualizadorDocumento');
    const btnCerrarModalVisualizador = document.getElementById('btnCerrarModalVisualizador');
    const tituloModalVisualizador = document.getElementById('tituloModalVisualizador');
    const contenidoModalVisualizador = document.getElementById('contenidoModalVisualizador');

    
    let listaDeApoyosGlobal = [];
    try {
        const rawApoyos = localStorage.getItem('listaDeApoyosUTP');
        if (rawApoyos) listaDeApoyosGlobal = JSON.parse(rawApoyos);
        if (!Array.isArray(listaDeApoyosGlobal)) listaDeApoyosGlobal = [];
    } catch (e) { console.error("GENERADOR.JS - Error al cargar listaDeApoyosUTP:", e); listaDeApoyosGlobal = []; }

    let listaAsistenciasConfirmadasGlobal = [];
    try {
        const rawAsistencias = localStorage.getItem('listaAsistenciasConfirmadasUTP');
        if (rawAsistencias) listaAsistenciasConfirmadasGlobal = JSON.parse(rawAsistencias);
        if (!Array.isArray(listaAsistenciasConfirmadasGlobal)) listaAsistenciasConfirmadasGlobal = [];
        console.log("GENERADOR.JS - listaAsistenciasConfirmadasGlobal cargada:", listaAsistenciasConfirmadasGlobal);
    } catch (e) { console.error("GENERADOR.JS - Error al cargar listaAsistenciasConfirmadasUTP:", e); listaAsistenciasConfirmadasGlobal = []; }

    let listaOCGeneradas = [];
    try {
        const rawOC = localStorage.getItem('listaOCGeneradasUTP');
        if (rawOC) listaOCGeneradas = JSON.parse(rawOC);
        if (!Array.isArray(listaOCGeneradas)) listaOCGeneradas = [];
    } catch (e) { console.error("GENERADOR.JS - Error al cargar listaOCGeneradasUTP:", e); listaOCGeneradas = []; }


    let asistenciasDelApoyoSeleccionado = [];
    let asistenciasSeleccionadasParaPago = [];

    // --- INICIALIZACIÓN ---
    function inicializar() {
        popularSelectApoyos();
        renderizarTablaOCGeneradas();
        if (selectApoyoParaOC) selectApoyoParaOC.addEventListener('change', manejarSeleccionApoyo);
        if (btnGenerarDocumentos) btnGenerarDocumentos.addEventListener('click', generarOCyNR);
        if (campoBusquedaOCGeneradas) campoBusquedaOCGeneradas.addEventListener('input', filtrarOCGeneradas);

        if (btnCerrarModalVisualizador) btnCerrarModalVisualizador.addEventListener('click', cerrarModalVisualizador);
        window.addEventListener('click', (event) => {
            if (event.target === modalVisualizador) {
                cerrarModalVisualizador();
            }
        });
    }

    function popularSelectApoyos() {
        if (!selectApoyoParaOC) return;
        selectApoyoParaOC.innerHTML = '<option value="">Seleccione un Apoyo...</option>';
        listaDeApoyosGlobal.forEach(apoyo => {
            const option = document.createElement('option');
            option.value = apoyo.id;
            option.textContent = `${apoyo.apellidos}, ${apoyo.nombres} (DNI: ${apoyo.dni})`;
            selectApoyoParaOC.appendChild(option);
        });
        if (listaDeApoyosGlobal.length === 0) {
            selectApoyoParaOC.innerHTML = '<option value="" disabled>No hay apoyos registrados</option>';
        }
    }

    function manejarSeleccionApoyo() {
        const apoyoIdValue = selectApoyoParaOC.value;
        asistenciasSeleccionadasParaPago = [];
        actualizarTablaResumen();

        if (!apoyoIdValue) { 
            seccionAsistenciasPendientes.style.display = 'none';
            seccionResumenOC.style.display = 'none';
            listaAsistenciasParaSeleccionar.innerHTML = '';
            return;
        }

        const apoyoId = parseInt(apoyoIdValue); 

        asistenciasDelApoyoSeleccionado = listaAsistenciasConfirmadasGlobal.filter(asistencia => {
            const tieneApoyoInfoId = asistencia.apoyoInfo && typeof asistencia.apoyoInfo.id === 'number';
            const tienePagoValido = typeof asistencia.pagoCalculado === 'number' && asistencia.pagoCalculado > 0;
            const tieneIdOriginal = typeof asistencia.idOriginalPlanificacion === 'number';

            if (!tieneApoyoInfoId || !tienePagoValido || !tieneIdOriginal) {
                //console.warn("GENERADOR.JS - Asistencia descartada por datos incompletos:", asistencia);
                return false;
            }

            return asistencia.apoyoInfo.id === apoyoId &&
                asistencia.pagoCalculado > 0 &&
                !yaIncluidaEnOC(asistencia.idOriginalPlanificacion);
        });

        console.log("GENERADOR.JS - Apoyo ID seleccionado:", apoyoId, "Asistencias filtradas para este apoyo:", asistenciasDelApoyoSeleccionado);


        renderizarListaAsistenciasParaSeleccionar();
        seccionAsistenciasPendientes.style.display = 'block';
        if (asistenciasDelApoyoSeleccionado.length === 0) {
            seccionResumenOC.style.display = 'none';
        }
    }

    function yaIncluidaEnOC(idAsistenciaOriginal) {
        if (typeof idAsistenciaOriginal !== 'number') return true;
        if (!listaOCGeneradas || !Array.isArray(listaOCGeneradas)) return false;

        return listaOCGeneradas.some(oc =>
            oc.asistenciasIncluidas &&
            Array.isArray(oc.asistenciasIncluidas) &&
            oc.asistenciasIncluidas.some(aInfo => aInfo.idOriginalPlanificacion === idAsistenciaOriginal)
        );
    }

    function renderizarListaAsistenciasParaSeleccionar() {
        listaAsistenciasParaSeleccionar.innerHTML = ''; // Limpiar siemre
        if (asistenciasDelApoyoSeleccionado.length === 0) {
            listaAsistenciasParaSeleccionar.innerHTML = '<p>Este apoyo no tiene asistencias pendientes de pago o todas ya han sido procesadas.</p>';
            seccionResumenOC.style.display = 'none';
            return;
        }

        asistenciasDelApoyoSeleccionado.forEach(asistencia => {
            const divItem = document.createElement('div');
            divItem.classList.add('item-asistencia');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = asistencia.idOriginalPlanificacion.toString();
            checkbox.id = `asistencia-${asistencia.idOriginalPlanificacion}`;
            checkbox.addEventListener('change', (e) => manejarSeleccionCheckboxAsistencia(e, asistencia));

            const label = document.createElement('label');
            label.htmlFor = `asistencia-${asistencia.idOriginalPlanificacion}`;
            // Validar fecha antes de formatear
            let fechaFormateada = asistencia.fecha;
            try {
                const fechaObj = new Date(asistencia.fecha + 'T00:00:00');
                if (!isNaN(fechaObj)) fechaFormateada = fechaObj.toLocaleDateString('es-ES');
            } catch (err) {/* Mantener original si falla */ }

            label.textContent = `Fecha: ${fechaFormateada} - Colegio: ${asistencia.colegioInfo ? asistencia.colegioInfo.nombre : 'N/A'} - Rol: ${asistencia.rol} (${asistencia.turno})`;

            const infoPago = document.createElement('span');
            infoPago.classList.add('info-pago');
            infoPago.textContent = `S/ ${(asistencia.pagoCalculado || 0).toFixed(2)}`;

            divItem.appendChild(checkbox);
            divItem.appendChild(label);
            divItem.appendChild(infoPago);
            listaAsistenciasParaSeleccionar.appendChild(divItem);
        });
    }

    function manejarSeleccionCheckboxAsistencia(event, asistencia) {
        const idOriginal = asistencia.idOriginalPlanificacion;
        if (event.target.checked) {
            if (!asistenciasSeleccionadasParaPago.find(a => a.idOriginalPlanificacion === idOriginal)) {
                asistenciasSeleccionadasParaPago.push(asistencia);
            }
        } else {
            asistenciasSeleccionadasParaPago = asistenciasSeleccionadasParaPago.filter(
                a => a.idOriginalPlanificacion !== idOriginal
            );
        }
        actualizarTablaResumen();
    }

    function actualizarTablaResumen() {
        cuerpoTablaResumenPago.innerHTML = '';
        let totalGeneral = 0;

        if (asistenciasSeleccionadasParaPago.length > 0) {
            seccionResumenOC.style.display = 'block';
            asistenciasSeleccionadasParaPago.forEach(asistencia => {
                const fila = cuerpoTablaResumenPago.insertRow();
                fila.insertCell().textContent = asistencia.apoyoInfo ? asistencia.apoyoInfo.nombreCompleto : 'N/A';

                let fechaFormateada = asistencia.fecha;
                try {
                    const fechaObj = new Date(asistencia.fecha + 'T00:00:00');
                    if (!isNaN(fechaObj)) fechaFormateada = fechaObj.toLocaleDateString('es-ES');
                } catch (err) {/* Mantener original si falla */ }
                fila.insertCell().textContent = fechaFormateada;

                fila.insertCell().textContent = asistencia.colegioInfo ? asistencia.colegioInfo.nombre : 'N/A';
                fila.insertCell().textContent = `${asistencia.rol.charAt(0).toUpperCase() + asistencia.rol.slice(1)} (${asistencia.turno})`;
                fila.insertCell().textContent = `S/ ${(asistencia.pagoCalculado || 0).toFixed(2)}`;
                totalGeneral += (asistencia.pagoCalculado || 0);
            });
        } else {
            seccionResumenOC.style.display = 'none';
        }
        totalAPagarOC.textContent = `S/ ${totalGeneral.toFixed(2)}`;
    }

    function generarOCyNR() {
        if (asistenciasSeleccionadasParaPago.length === 0) {
            alert('Debe seleccionar al menos una asistencia para generar la OC/NR.');
            return;
        }

        const primeraAsistenciaSeleccionada = asistenciasSeleccionadasParaPago[0];
        if (!primeraAsistenciaSeleccionada || !primeraAsistenciaSeleccionada.apoyoInfo) {
            alert("Error: No se pudo obtener la información del apoyo de la asistencia seleccionada.");
            return;
        }
        const apoyoInfoConsolidada = primeraAsistenciaSeleccionada.apoyoInfo;
        const fechaGeneracion = new Date().toISOString();
        const numeroOC = `OC-UTP-${Date.now()}`;

        const nuevaOCGenerada = {
            id: numeroOC,
            apoyoId: apoyoInfoConsolidada.id,
            apoyoNombre: apoyoInfoConsolidada.nombreCompleto,
            fechaGeneracion: fechaGeneracion,
            totalPagado: asistenciasSeleccionadasParaPago.reduce((sum, a) => sum + (a.pagoCalculado || 0), 0),
            asistenciasIncluidas: asistenciasSeleccionadasParaPago.map(a => ({
                idOriginalPlanificacion: a.idOriginalPlanificacion,
                fechaAsistencia: a.fecha,
                colegioNombre: a.colegioInfo ? a.colegioInfo.nombre : 'N/A',
                rol: a.rol,
                turno: a.turno,
                pago: (a.pagoCalculado || 0)
            })),
            proveedorRUC: apoyoInfoConsolidada.ruc || 'N/A',
            proveedorEmail: apoyoInfoConsolidada.correo || 'N/A',
        };

        listaOCGeneradas.push(nuevaOCGenerada);
        try {
            localStorage.setItem('listaOCGeneradasUTP', JSON.stringify(listaOCGeneradas));
        } catch (e) {
            console.error("GENERADOR.JS - Error guardando listaOCGeneradasUTP:", e);
        }


        alert(`OC/NR ${numeroOC} generada exitosamente para ${apoyoInfoConsolidada.nombreCompleto}.`);

        asistenciasSeleccionadasParaPago = [];
        manejarSeleccionApoyo();
        renderizarTablaOCGeneradas();
    }

    function renderizarTablaOCGeneradas(filtrados = listaOCGeneradas) {
        if (!cuerpoTablaOCGeneradas) return;
        cuerpoTablaOCGeneradas.innerHTML = '';
        if (filtrados.length === 0) {
            const filaVacia = cuerpoTablaOCGeneradas.insertRow();
            const celdaVacia = filaVacia.insertCell();
            celdaVacia.colSpan = 6;
            celdaVacia.textContent = 'No hay OC/NR generadas o que coincidan con la búsqueda.';
            celdaVacia.style.textAlign = 'center';
            return;
        }

        filtrados.sort((a, b) => new Date(b.fechaGeneracion).getTime() - new Date(a.fechaGeneracion).getTime());

        filtrados.forEach(oc => {
            const fila = cuerpoTablaOCGeneradas.insertRow();
            fila.insertCell().textContent = oc.id;
            fila.insertCell().textContent = oc.apoyoNombre;
            fila.insertCell().textContent = new Date(oc.fechaGeneracion).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
            fila.insertCell().textContent = `S/ ${(oc.totalPagado || 0).toFixed(2)}`;

            const celdaAsistencias = fila.insertCell();
            const spanAsistencias = document.createElement('span');
            const numAsistencias = oc.asistenciasIncluidas ? oc.asistenciasIncluidas.length : 0;
            spanAsistencias.textContent = `${numAsistencias} asistencia(s)`;
            if (numAsistencias > 0) {
                spanAsistencias.classList.add('asistencias-tooltip');
                let tooltipText = oc.asistenciasIncluidas.map(a => {
                    let fechaAsistFormateada = a.fechaAsistencia;
                    try {
                        const fechaObj = new Date(a.fechaAsistencia + 'T00:00:00');
                        if (!isNaN(fechaObj)) fechaAsistFormateada = fechaObj.toLocaleDateString('es-ES');
                    } catch (e) { }
                    return `Fecha: ${fechaAsistFormateada}, Rol: ${a.rol}, Pago: S/${(a.pago || 0).toFixed(2)}`;
                }).join('\n');
                spanAsistencias.title = tooltipText;
            }
            celdaAsistencias.appendChild(spanAsistencias);

            const celdaAcciones = fila.insertCell();
            const btnVerOC = document.createElement('button');
            btnVerOC.textContent = 'Ver OC (Sim)';
            btnVerOC.classList.add('boton-accion');
            btnVerOC.addEventListener('click', () => mostrarDocumentoSimulado(oc, 'OC'));
            celdaAcciones.appendChild(btnVerOC);

            const btnVerNR = document.createElement('button');
            btnVerNR.textContent = 'Ver NR (Sim)';
            btnVerNR.classList.add('boton-accion');
            btnVerNR.addEventListener('click', () => mostrarDocumentoSimulado(oc, 'NR'));
            celdaAcciones.appendChild(btnVerNR);
        });
    }

    function filtrarOCGeneradas(e) {
        const termino = e.target.value.toLowerCase().trim();
        const filtrados = listaOCGeneradas.filter(oc =>
            (oc.id && oc.id.toLowerCase().includes(termino)) ||
            (oc.apoyoNombre && oc.apoyoNombre.toLowerCase().includes(termino)) ||
            (oc.fechaGeneracion && new Date(oc.fechaGeneracion).toLocaleDateString('es-ES').includes(termino))
        );
        renderizarTablaOCGeneradas(filtrados);
    }

    function mostrarDocumentoSimulado(ocData, tipoDocumento) {
        if (!tituloModalVisualizador || !contenidoModalVisualizador || !modalVisualizador) return;
        tituloModalVisualizador.textContent = `Simulación de ${tipoDocumento} - ${ocData.id}`;

        let contenido = `--- ${tipoDocumento} --- \n`;
        contenido += `Nº Documento: ${ocData.id}\n`;
        contenido += `Fecha Generación: ${new Date(ocData.fechaGeneracion).toLocaleString('es-ES')}\n`;
        contenido += `Proveedor: ${ocData.apoyoNombre}\n`;
        contenido += `RUC Proveedor: ${ocData.proveedorRUC || 'N/A'}\n`;
        contenido += `Email Proveedor: ${ocData.proveedorEmail || 'N/A'}\n`;

        if (tipoDocumento === 'OC') {
            contenido += `\n--- Detalles de la Orden de Compra ---\n`;
            if (ocData.asistenciasIncluidas && ocData.asistenciasIncluidas.length > 0) {
                ocData.asistenciasIncluidas.forEach((item, index) => {
                    let fechaAsistFormateadaOC = item.fechaAsistencia;
                    try {
                        const fechaObj = new Date(item.fechaAsistencia + 'T00:00:00');
                        if (!isNaN(fechaObj)) fechaAsistFormateadaOC = fechaObj.toLocaleDateString('es-ES');
                    } catch (e) { }
                    contenido += `Item ${index + 1}:\n`;
                    contenido += `  Descripción: Servicio de Apoyo - Fecha: ${fechaAsistFormateadaOC}, Colegio: ${item.colegioNombre || 'N/A'}, Rol: ${item.rol}\n`;
                    contenido += `  Cantidad: 1\n`;
                    contenido += `  Precio Unitario: S/ ${(item.pago || 0).toFixed(2)}\n`;
                    contenido += `  Importe: S/ ${(item.pago || 0).toFixed(2)}\n\n`;
                });
            }
            contenido += `SubTotal: S/ ${(ocData.totalPagado || 0).toFixed(2)}\n`;
            contenido += `IGV (0%): S/ 0.00\n`;
            contenido += `Total OC: S/ ${(ocData.totalPagado || 0).toFixed(2)}\n`;
        } else if (tipoDocumento === 'NR') {
            contenido += `Id Pedido (OC): ${ocData.id}\n`;
            contenido += `Fecha Recepción: ${new Date(ocData.fechaGeneracion).toLocaleDateString('es-ES')}\n`;
            contenido += `\n--- Detalles de la Nota de Recepción ---\n`;
            if (ocData.asistenciasIncluidas && ocData.asistenciasIncluidas.length > 0) {
                ocData.asistenciasIncluidas.forEach((item, index) => {
                    let fechaAsistFormateadaNR = item.fechaAsistencia;
                    try {
                        const fechaObj = new Date(item.fechaAsistencia + 'T00:00:00');
                        if (!isNaN(fechaObj)) fechaAsistFormateadaNR = fechaObj.toLocaleDateString('es-ES');
                    } catch (e) { }
                    contenido += `Item ${index + 1} Recibido:\n`;
                    contenido += `  Descripción: Servicio de Apoyo - Fecha: ${fechaAsistFormateadaNR}, Colegio: ${item.colegioNombre || 'N/A'}, Rol: ${item.rol}\n`;
                    contenido += `  Cantidad Recibida: 1\n`;
                    contenido += `  Precio OC: S/ ${(item.pago || 0).toFixed(2)}\n`;
                    contenido += `  Subtotal: S/ ${(item.pago || 0).toFixed(2)}\n\n`;
                });
            }
            contenido += `Total Recibido: S/ ${(ocData.totalPagado || 0).toFixed(2)}\n`;
        }

        contenidoModalVisualizador.textContent = contenido;
        modalVisualizador.style.display = 'block';
    }

    function cerrarModalVisualizador() {
        if (modalVisualizador) modalVisualizador.style.display = 'none';
    }

    // Iniciar la aplicación
    inicializar();
});