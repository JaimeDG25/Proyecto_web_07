//Desarrollo_Web/Eventos_utp/static/js/index.js

console.log("hola mundo desde un scrip en una carpeta aparte")
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

    // --- MANEJO DE APOYOS ---
    const modalGestionApoyo = document.getElementById('modalGestionApoyo');
    const btnAbrirModalNuevoApoyo = document.getElementById('btnAbrirModalNuevoApoyo');
    const btnCerrarModalApoyo = document.getElementById('btnCerrarModalApoyo');
    const btnCancelarModalApoyo = document.getElementById('btnCancelarModalApoyo');
    const formularioApoyo = document.getElementById('formularioApoyo');
    const cuerpoTablaApoyos = document.getElementById('cuerpoTablaApoyos');
    const campoBusquedaApoyo = document.getElementById('campoBusquedaApoyo');
    const tituloModalApoyo = document.getElementById('tituloModalApoyo');
    const idApoyoEditarInput = document.getElementById('idApoyoEditar');

    // Cargar apoyos desde localStorage 
    let listaDeApoyos = JSON.parse(localStorage.getItem('listaDeApoyosUTP')) || [];

    let proximoIdApoyo = listaDeApoyos.length > 0 ? Math.max(...listaDeApoyos.map(a => a.id)) + 1 : 1;
    let idApoyoEnEdicion = null;

    // guardo en local
    function guardarApoyosEnLocalStorage() {
        localStorage.setItem('listaDeApoyosUTP', JSON.stringify(listaDeApoyos));
    }

    // --- FUNCIONES DEL MODAL ---
    function abrirModal(modo = 'nuevo', apoyo = null) {
        if (!formularioApoyo || !modalGestionApoyo || !tituloModalApoyo || !idApoyoEditarInput) {
            console.error("Faltan elementos del DOM para el modal de apoyo.");
            return;
        }
        formularioApoyo.reset();
        if (modo === 'editar' && apoyo) {
            tituloModalApoyo.textContent = 'Editar Apoyo';
            idApoyoEditarInput.value = apoyo.id;
            document.getElementById('apellidosApoyo').value = apoyo.apellidos;
            document.getElementById('nombresApoyo').value = apoyo.nombres;
            document.getElementById('telefonoApoyo').value = apoyo.telefono || '';
            document.getElementById('dniApoyo').value = apoyo.dni;
            document.getElementById('rucApoyo').value = apoyo.ruc || '';
            document.getElementById('correoApoyo').value = apoyo.correo;
            idApoyoEnEdicion = apoyo.id;
        } else {
            tituloModalApoyo.textContent = 'Registrar Nuevo Apoyo';
            idApoyoEditarInput.value = '';
            idApoyoEnEdicion = null;
        }
        modalGestionApoyo.style.display = 'block';
    }

    function cerrarModal() {
        if (!modalGestionApoyo || !formularioApoyo) return;
        modalGestionApoyo.style.display = 'none';
        formularioApoyo.reset();
        idApoyoEnEdicion = null;
        idApoyoEditarInput.value = '';
    }

    // --- EVENT LISTENERS PARA EL MODAL ---
    if (btnAbrirModalNuevoApoyo) {
        btnAbrirModalNuevoApoyo.addEventListener('click', () => abrirModal('nuevo'));
    }
    if (btnCerrarModalApoyo) {
        btnCerrarModalApoyo.addEventListener('click', cerrarModal);
    }
    if (btnCancelarModalApoyo) {
        btnCancelarModalApoyo.addEventListener('click', cerrarModal);
    }

    window.addEventListener('click', function (evento) {
        if (evento.target === modalGestionApoyo) {
            cerrarModal();
        }
    });

    // --- RENDERIZAR TABLA DE APOYOS ---
    function renderizarTablaApoyos(apoyosParaMostrar = listaDeApoyos) {
        if (!cuerpoTablaApoyos) return;
        cuerpoTablaApoyos.innerHTML = '';
        if (apoyosParaMostrar.length === 0) {
            const filaVacia = cuerpoTablaApoyos.insertRow();
            const celdaVacia = filaVacia.insertCell();
            celdaVacia.colSpan = 6;
            celdaVacia.textContent = 'No hay apoyos registrados o que coincidan con la búsqueda.';
            celdaVacia.style.textAlign = 'center';
            celdaVacia.style.padding = '20px';
            return;
        }
        apoyosParaMostrar.forEach(apoyo => {
            const fila = cuerpoTablaApoyos.insertRow();
            fila.insertCell().textContent = `${apoyo.apellidos} ${apoyo.nombres}`;
            fila.insertCell().textContent = apoyo.telefono || '-';
            fila.insertCell().textContent = apoyo.dni;
            fila.insertCell().textContent = apoyo.ruc || '-';
            fila.insertCell().textContent = apoyo.correo;
            const celdaAcciones = fila.insertCell();
            celdaAcciones.style.whiteSpace = 'nowrap';
            const botonEditar = document.createElement('button');
            botonEditar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M5 18.89H6.41421L15.7279 9.57629L14.3137 8.16207L5 17.4758V18.89ZM21 11.1621L12.7279 2.89H11.3137L2.46447 11.7376C2.17157 12.0305 2 12.4369 2 12.8625V18.89C2 19.4423 2.44772 19.89 3 19.89H9.02754C9.45312 19.89 9.85953 19.7184 10.1524 19.4255L18.4246 11.1534L19.8388 12.5676L18.8476 13.5588L19.5547 14.2659L21.2929 12.5278C21.6834 12.1373 21.6834 11.5041 21.2929 11.1136L19.8787 9.70001L21 8.57871V11.1621Z"></path></svg> Editar';
            botonEditar.classList.add('boton-accion', 'boton-editar');
            botonEditar.addEventListener('click', () => abrirModal('editar', apoyo));
            celdaAcciones.appendChild(botonEditar);
            const botonEliminar = document.createElement('button');
            botonEliminar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 6V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7ZM9 4V6H15V4H9Z"></path></svg> Eliminar';
            botonEliminar.classList.add('boton-accion', 'boton-eliminar');
            botonEliminar.addEventListener('click', () => eliminarApoyo(apoyo.id));
            celdaAcciones.appendChild(botonEliminar);
        });
    }

    // --- MANEJO DEL FORMULARIO ---
    if (formularioApoyo) {
        formularioApoyo.addEventListener('submit', function (evento) {
            evento.preventDefault();
            const datosApoyo = {
                apellidos: document.getElementById('apellidosApoyo').value.trim(),
                nombres: document.getElementById('nombresApoyo').value.trim(),
                telefono: document.getElementById('telefonoApoyo').value.trim() || null,
                dni: document.getElementById('dniApoyo').value.trim(),
                ruc: document.getElementById('rucApoyo').value.trim() || null,
                correo: document.getElementById('correoApoyo').value.trim()
            };
            if (!datosApoyo.apellidos || !datosApoyo.nombres || !datosApoyo.dni || !datosApoyo.correo) {
                alert('Por favor, complete todos los campos obligatorios (Apellidos, Nombres, DNI, Correo).');
                return;
            }
            const esDniDuplicado = listaDeApoyos.some(
                apoyoExistente => apoyoExistente.dni === datosApoyo.dni && (idApoyoEnEdicion === null || apoyoExistente.id !== idApoyoEnEdicion)
            );
            if (esDniDuplicado) {
                alert('El DNI ingresado ya existe para otro apoyo. Por favor, use uno diferente.');
                return;
            }
            if (datosApoyo.dni.length !== 8 || !/^\d+$/.test(datosApoyo.dni)) {
                alert('El DNI debe tener 8 dígitos numéricos.');
                return;
            }
            if (datosApoyo.ruc && (datosApoyo.ruc.length !== 11 || !/^\d+$/.test(datosApoyo.ruc))) {
                alert('El RUC debe tener 11 dígitos numéricos.');
                return;
            }
            if (idApoyoEnEdicion !== null) {
                const indice = listaDeApoyos.findIndex(a => a.id === idApoyoEnEdicion);
                if (indice !== -1) {
                    listaDeApoyos[indice] = { ...listaDeApoyos[indice], ...datosApoyo };
                }
            } else {
                datosApoyo.id = proximoIdApoyo++;
                listaDeApoyos.push(datosApoyo);
            }
            guardarApoyosEnLocalStorage();
            renderizarTablaApoyos();
            cerrarModal();
        });
    }

    // --- ELIMINAR APOYO ---
    function eliminarApoyo(idApoyo) {
        if (confirm('¿Está seguro de que desea eliminar este apoyo? Esta acción no se puede deshacer.')) {
            listaDeApoyos = listaDeApoyos.filter(apoyo => apoyo.id !== idApoyo);
            guardarApoyosEnLocalStorage();
            renderizarTablaApoyos();
        }
    }

    // --- BUSQUEDA DE APOYOS ---
    if (campoBusquedaApoyo) {
        campoBusquedaApoyo.addEventListener('input', function (evento) {
            const terminoBusqueda = evento.target.value.toLowerCase().trim();
            const apoyosFiltrados = listaDeApoyos.filter(apoyo => {
                const nombreCompleto = `${apoyo.apellidos} ${apoyo.nombres}`.toLowerCase();
                const dni = apoyo.dni.toLowerCase();
                const ruc = (apoyo.ruc || '').toLowerCase();
                const correo = apoyo.correo.toLowerCase();
                return nombreCompleto.includes(terminoBusqueda) ||
                    dni.includes(terminoBusqueda) ||
                    ruc.includes(terminoBusqueda) ||
                    correo.includes(terminoBusqueda);
            });
            renderizarTablaApoyos(apoyosFiltrados);
        });
    }
    renderizarTablaApoyos();
});