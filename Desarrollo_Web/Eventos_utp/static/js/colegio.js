document.addEventListener('DOMContentLoaded', function () {
    // --- MANEJO DE BARRA LATERAL ---
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

    // --- MANEJO DE COLEGIOS ---
    const modalGestionColegio = document.getElementById('modalGestionColegio');
    const btnAbrirModalNuevoColegio = document.getElementById('btnAbrirModalNuevoColegio');
    const btnCerrarModalColegio = document.getElementById('btnCerrarModalColegio');
    const btnCancelarModalColegio = document.getElementById('btnCancelarModalColegio');
    const formularioColegio = document.getElementById('formularioColegio');
    const cuerpoTablaColegios = document.getElementById('cuerpoTablaColegios');
    const campoBusquedaColegio = document.getElementById('campoBusquedaColegio');
    const tituloModalColegio = document.getElementById('tituloModalColegio');
    const idColegioEditarInput = document.getElementById('idColegioEditar');
    const inputFileBd = document.getElementById('archivoBdColegio');
    const nombreArchivoActualInfo = document.getElementById('nombreArchivoActual');
    const selectPromotorColegio = document.getElementById('promotorColegio'); // Elemento select para promotores

    //  datos de ejemplo 
    let listaDeColegios = JSON.parse(localStorage.getItem('listaDeColegiosUTP')) || [
        { id: 1, nombre: "Colegio Innova Schools", promotorId: "1", apellidosEncargado: "García", nombreEncargado: "Luis", telefonoEncargado: "999888777", distrito: "Miraflores", linkUbicacion: "https://maps.app.goo.gl/ejemplo1", nombreArchivoBd: "base_datos_innova.xlsx" },
        { id: 2, nombre: "IE Emblemático Alfonso Ugarte", promotorId: "2", apellidosEncargado: "Martínez", nombreEncargado: "Ana", telefonoEncargado: "911222333", distrito: "San Isidro", linkUbicacion: "https://maps.app.goo.gl/ejemplo2", nombreArchivoBd: "matriculados_ugarte.xls" }
    ];

    let listaDePromotoresGlobal = JSON.parse(localStorage.getItem('listaDePromotoresUTP')) || [];

    let proximoIdColegio = listaDeColegios.length > 0 ? Math.max(...listaDeColegios.map(c => c.id)) + 1 : 1;
    let idColegioEnEdicion = null;
    let archivoSeleccionado = null;

    function guardarColegiosEnLocalStorage() {
        localStorage.setItem('listaDeColegiosUTP', JSON.stringify(listaDeColegios));
    }

    function actualizarListaPromotoresGlobal() {
        listaDePromotoresGlobal = JSON.parse(localStorage.getItem('listaDePromotoresUTP')) || [];
    }

    // --- FUNCIONES PARA PROMOTORES EN EL SELECT ---
    function cargarPromotoresEnSelect() {
        if (!selectPromotorColegio) return;

        actualizarListaPromotoresGlobal(); // Asegurar que tenemos la lista más reciente
        selectPromotorColegio.innerHTML = '<option value="">Seleccione un promotor...</option>';

        if (listaDePromotoresGlobal.length > 0) {
            listaDePromotoresGlobal.forEach(promotor => {
                const option = document.createElement('option');
                option.value = promotor.id.toString(); // Guardar el ID del promotor como valor
                option.textContent = `${promotor.apellidos}, ${promotor.nombres} (${promotor.codigo})`;
                selectPromotorColegio.appendChild(option);
            });
        } else {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "No hay promotores registrados";
            option.disabled = true;
            selectPromotorColegio.appendChild(option);
        }
    }


    // --- FUNCIONES DEL MODAL DE COLEGIO ---
    function abrirModal(modo = 'nuevo', colegio = null) {
        if (!formularioColegio || !modalGestionColegio || !tituloModalColegio || !idColegioEditarInput || !inputFileBd || !nombreArchivoActualInfo) {
            console.error("Faltan elementos del DOM para el modal de colegio.");
            return;
        }
        formularioColegio.reset();
        nombreArchivoActualInfo.textContent = '';
        nombreArchivoActualInfo.style.display = 'none';
        idColegioEnEdicion = null;
        idColegioEditarInput.value = '';
        archivoSeleccionado = null;
        inputFileBd.value = null;

        cargarPromotoresEnSelect(); // Cargar promotores en el select

        if (modo === 'editar' && colegio) {
            tituloModalColegio.textContent = 'Editar Colegio';
            idColegioEnEdicion = colegio.id;
            idColegioEditarInput.value = colegio.id;
            document.getElementById('nombreColegio').value = colegio.nombre;
            selectPromotorColegio.value = colegio.promotorId || ''; // Seleccionar el promotor guardado
            document.getElementById('apellidosEncargadoColegio').value = colegio.apellidosEncargado;
            document.getElementById('nombreEncargadoColegio').value = colegio.nombreEncargado;
            document.getElementById('telefonoEncargadoColegio').value = colegio.telefonoEncargado;
            document.getElementById('distritoColegio').value = colegio.distrito;
            document.getElementById('linkUbicacionColegio').value = colegio.linkUbicacion || '';

            if (colegio.nombreArchivoBd) {
                nombreArchivoActualInfo.textContent = `Archivo actual: ${colegio.nombreArchivoBd}`;
                nombreArchivoActualInfo.style.display = 'block';
            }
        } else {
            tituloModalColegio.textContent = 'Registrar Nuevo Colegio';
        }
        modalGestionColegio.style.display = 'block';
    }

    function cerrarModal() {
        if (!modalGestionColegio || !formularioColegio) return;
        modalGestionColegio.style.display = 'none';
        formularioColegio.reset();
        idColegioEnEdicion = null;
        idColegioEditarInput.value = '';
        archivoSeleccionado = null;
        if (inputFileBd) inputFileBd.value = null;
        if (nombreArchivoActualInfo) {
            nombreArchivoActualInfo.textContent = '';
            nombreArchivoActualInfo.style.display = 'none';
        }
    }

    if (btnAbrirModalNuevoColegio) {
        btnAbrirModalNuevoColegio.addEventListener('click', () => abrirModal('nuevo'));
    }
    if (btnCerrarModalColegio) {
        btnCerrarModalColegio.addEventListener('click', cerrarModal);
    }
    if (btnCancelarModalColegio) {
        btnCancelarModalColegio.addEventListener('click', cerrarModal);
    }
    window.addEventListener('click', function (evento) {
        if (evento.target === modalGestionColegio) {
            cerrarModal();
        }
    });

    if (inputFileBd) {
        inputFileBd.addEventListener('change', function (evento) {
            if (evento.target.files.length > 0) {
                archivoSeleccionado = evento.target.files[0];
                nombreArchivoActualInfo.textContent = `Archivo seleccionado: ${archivoSeleccionado.name}`;
                nombreArchivoActualInfo.style.display = 'block';
            } else {
                archivoSeleccionado = null;
                const colegioActual = idColegioEnEdicion ? listaDeColegios.find(c => c.id === idColegioEnEdicion) : null;
                if (colegioActual && colegioActual.nombreArchivoBd) {
                    nombreArchivoActualInfo.textContent = `Archivo actual: ${colegioActual.nombreArchivoBd}`;
                    nombreArchivoActualInfo.style.display = 'block';
                } else {
                    nombreArchivoActualInfo.textContent = '';
                    nombreArchivoActualInfo.style.display = 'none';
                }
            }
        });
    }

    // --- RENDERIZAR TABLA DE COLEGIOS ---
    function renderizarTablaColegios(colegiosParaMostrar = listaDeColegios) {
        if (!cuerpoTablaColegios) return;
        cuerpoTablaColegios.innerHTML = '';

        actualizarListaPromotoresGlobal();

        if (colegiosParaMostrar.length === 0) {
            const filaVacia = cuerpoTablaColegios.insertRow();
            const celdaVacia = filaVacia.insertCell();
            celdaVacia.colSpan = 8;
            celdaVacia.textContent = 'No hay colegios registrados o que coincidan con la búsqueda.';
            celdaVacia.style.textAlign = 'center';
            celdaVacia.style.padding = '20px';
            return;
        }

        colegiosParaMostrar.forEach(colegio => {
            const fila = cuerpoTablaColegios.insertRow();
            fila.insertCell().textContent = colegio.nombre;

            // Buscar info del promotor para mostrar nombre en lugar de ID
            const promotorDelColegio = listaDePromotoresGlobal.find(p => p.id.toString() === colegio.promotorId);
            const textoPromotor = promotorDelColegio
                ? `${promotorDelColegio.apellidos}, ${promotorDelColegio.nombres} (${promotorDelColegio.codigo})`
                : (colegio.promotorId ? `ID Promotor: ${colegio.promotorId} (No encontrado)` : '-');
            fila.insertCell().textContent = textoPromotor;

            fila.insertCell().textContent = `${colegio.apellidosEncargado}, ${colegio.nombreEncargado}`;
            fila.insertCell().textContent = colegio.telefonoEncargado;
            fila.insertCell().textContent = colegio.distrito;

            const celdaUbicacion = fila.insertCell();
            if (colegio.linkUbicacion) {
                const enlace = document.createElement('a');
                enlace.href = colegio.linkUbicacion;
                enlace.textContent = 'Ver Mapa';
                enlace.target = '_blank';
                enlace.rel = 'noopener noreferrer';
                celdaUbicacion.appendChild(enlace);
            } else {
                celdaUbicacion.textContent = '-';
            }

            fila.insertCell().textContent = colegio.nombreArchivoBd || 'No adjunto';

            const celdaAcciones = fila.insertCell();
            celdaAcciones.style.whiteSpace = 'nowrap';

            const botonEditar = document.createElement('button');
            botonEditar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M5 18.89H6.41421L15.7279 9.57629L14.3137 8.16207L5 17.4758V18.89ZM21 11.1621L12.7279 2.89H11.3137L2.46447 11.7376C2.17157 12.0305 2 12.4369 2 12.8625V18.89C2 19.4423 2.44772 19.89 3 19.89H9.02754C9.45312 19.89 9.85953 19.7184 10.1524 19.4255L18.4246 11.1534L19.8388 12.5676L18.8476 13.5588L19.5547 14.2659L21.2929 12.5278C21.6834 12.1373 21.6834 11.5041 21.2929 11.1136L19.8787 9.70001L21 8.57871V11.1621Z"></path></svg> Editar';
            botonEditar.classList.add('boton-accion', 'boton-editar');
            botonEditar.addEventListener('click', () => abrirModal('editar', colegio));
            celdaAcciones.appendChild(botonEditar);

            const botonEliminar = document.createElement('button');
            botonEliminar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 6V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7ZM9 4V6H15V4H9Z"></path></svg> Eliminar';
            botonEliminar.classList.add('boton-accion', 'boton-eliminar');
            botonEliminar.addEventListener('click', () => eliminarColegio(colegio.id));
            celdaAcciones.appendChild(botonEliminar);
        });
    }

    // --- MANEJO DEL FORMULARIO  ---
    if (formularioColegio) {
        formularioColegio.addEventListener('submit', function (evento) {
            evento.preventDefault();

            const datosColegio = {
                nombre: document.getElementById('nombreColegio').value.trim(),
                promotorId: selectPromotorColegio.value, // Guardar el ID del promotor
                apellidosEncargado: document.getElementById('apellidosEncargadoColegio').value.trim(),
                nombreEncargado: document.getElementById('nombreEncargadoColegio').value.trim(),
                telefonoEncargado: document.getElementById('telefonoEncargadoColegio').value.trim(),
                distrito: document.getElementById('distritoColegio').value.trim(),
                linkUbicacion: document.getElementById('linkUbicacionColegio').value.trim() || null,
                nombreArchivoBd: archivoSeleccionado
                    ? archivoSeleccionado.name
                    : (idColegioEnEdicion
                        ? listaDeColegios.find(c => c.id === idColegioEnEdicion)?.nombreArchivoBd
                        : null)
            };

            if (!datosColegio.nombre || !datosColegio.promotorId || !datosColegio.apellidosEncargado || !datosColegio.nombreEncargado || !datosColegio.telefonoEncargado || !datosColegio.distrito) {
                alert('Por favor, complete los campos obligatorios: Nombre Colegio, Promotor, Apellidos Encargado, Nombres Encargado, Teléfono Encargado y Distrito.');
                return;
            }

            if (idColegioEnEdicion !== null) {
                const indice = listaDeColegios.findIndex(c => c.id === idColegioEnEdicion);
                if (indice !== -1) {
                    listaDeColegios[indice] = { ...listaDeColegios[indice], ...datosColegio, id: idColegioEnEdicion };
                }
            } else {
                datosColegio.id = proximoIdColegio++;
                listaDeColegios.push(datosColegio);
            }

            guardarColegiosEnLocalStorage();
            idColegioEnEdicion = null;
            archivoSeleccionado = null;
            renderizarTablaColegios();
            cerrarModal();
        });
    }

    // --- ELIMINAR COLE ---
    function eliminarColegio(idColegio) {
        if (confirm('¿Está seguro de que desea eliminar este colegio? Esta acción no se puede deshacer.')) {
            listaDeColegios = listaDeColegios.filter(colegio => colegio.id !== idColegio);
            guardarColegiosEnLocalStorage();
            renderizarTablaColegios();
        }
    }

    // --- BUSQUEDA DE COLEGIOS ---
    if (campoBusquedaColegio) {
        campoBusquedaColegio.addEventListener('input', function (evento) {
            const terminoBusqueda = evento.target.value.toLowerCase().trim();
            actualizarListaPromotoresGlobal();

            const colegiosFiltrados = listaDeColegios.filter(colegio => {
                const nombre = colegio.nombre.toLowerCase();
                const promotorDelColegio = listaDePromotoresGlobal.find(p => p.id.toString() === colegio.promotorId);
                const textoPromotor = promotorDelColegio
                    ? `${promotorDelColegio.apellidos} ${promotorDelColegio.nombres} ${promotorDelColegio.codigo}`.toLowerCase()
                    : '';
                const encargado = `${colegio.apellidosEncargado} ${colegio.nombreEncargado}`.toLowerCase();
                const distrito = colegio.distrito.toLowerCase();

                return nombre.includes(terminoBusqueda) ||
                    textoPromotor.includes(terminoBusqueda) ||
                    encargado.includes(terminoBusqueda) ||
                    distrito.includes(terminoBusqueda);
            });
            renderizarTablaColegios(colegiosFiltrados);
        });
    }

    actualizarListaPromotoresGlobal();
    renderizarTablaColegios();
});