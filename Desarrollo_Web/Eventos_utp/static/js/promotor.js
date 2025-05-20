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

    // --- MANEJO DE PROMOTORES ---
    const modalGestionPromotor = document.getElementById('modalGestionPromotor');
    const btnAbrirModalNuevoPromotor = document.getElementById('btnAbrirModalNuevoPromotor');
    const btnCerrarModalPromotor = document.getElementById('btnCerrarModalPromotor');
    const btnCancelarModalPromotor = document.getElementById('btnCancelarModalPromotor');
    const formularioPromotor = document.getElementById('formularioPromotor');
    const cuerpoTablaPromotores = document.getElementById('cuerpoTablaPromotores');
    const campoBusquedaPromotor = document.getElementById('campoBusquedaPromotor');
    const tituloModalPromotor = document.getElementById('tituloModalPromotor');
    const idPromotorEditarInput = document.getElementById('idPromotorEditar');

    // Cargar promotores desde local
    let listaDePromotores = JSON.parse(localStorage.getItem('listaDePromotoresUTP')) || [
        { id: 1, apellidos: "Gonzales", nombres: "Carlos Alberto", telefono: "987654321", codigo: "PROM001", correo: "cgonzales@utp.edu.pe", dni: "12345678" },
        { id: 2, apellidos: "Rodriguez", nombres: "Ana María", telefono: "912345679", codigo: "PROM002", correo: "arodriguez@utp.edu.pe", dni: "87654321" }
    ];

    let proximoIdPromotor = listaDePromotores.length > 0 ? Math.max(...listaDePromotores.map(p => p.id)) + 1 : 1;
    let idPromotorEnEdicion = null;

    function guardarPromotoresEnLocalStorage() {
        localStorage.setItem('listaDePromotoresUTP', JSON.stringify(listaDePromotores));
    }

    // --- FUNCIONES DEL MODAL ---
    function abrirModal(modo = 'nuevo', promotor = null) {
        formularioPromotor.reset();
        idPromotorEnEdicion = null;
        idPromotorEditarInput.value = '';

        if (modo === 'editar' && promotor) {
            tituloModalPromotor.textContent = 'Editar Promotor';
            idPromotorEnEdicion = promotor.id;
            idPromotorEditarInput.value = promotor.id;
            document.getElementById('apellidosPromotor').value = promotor.apellidos;
            document.getElementById('nombresPromotor').value = promotor.nombres;
            document.getElementById('telefonoPromotor').value = promotor.telefono;
            document.getElementById('codigoPromotor').value = promotor.codigo;
            document.getElementById('correoPromotor').value = promotor.correo;
            document.getElementById('dniPromotor').value = promotor.dni;
        } else {
            tituloModalPromotor.textContent = 'Registrar Nuevo Promotor';
        }
        if (modalGestionPromotor) modalGestionPromotor.style.display = 'block';
    }

    function cerrarModal() {
        if (modalGestionPromotor) modalGestionPromotor.style.display = 'none';
        formularioPromotor.reset();
        idPromotorEnEdicion = null;
        idPromotorEditarInput.value = '';
    }

    if (btnAbrirModalNuevoPromotor) {
        btnAbrirModalNuevoPromotor.addEventListener('click', () => abrirModal('nuevo'));
    }
    if (btnCerrarModalPromotor) {
        btnCerrarModalPromotor.addEventListener('click', cerrarModal);
    }
    if (btnCancelarModalPromotor) {
        btnCancelarModalPromotor.addEventListener('click', cerrarModal);
    }
    window.addEventListener('click', function (evento) {
        if (evento.target === modalGestionPromotor) {
            cerrarModal();
        }
    });

    // --- RENDERIZAR TABLA ---
    function renderizarTablaPromotores(promotoresParaMostrar = listaDePromotores) {
        if (!cuerpoTablaPromotores) return;
        cuerpoTablaPromotores.innerHTML = '';

        if (promotoresParaMostrar.length === 0) {
            const filaVacia = cuerpoTablaPromotores.insertRow();
            const celdaVacia = filaVacia.insertCell();
            celdaVacia.colSpan = 6;
            celdaVacia.textContent = 'No hay promotores registrados o que coincidan con la búsqueda.';
            celdaVacia.style.textAlign = 'center';
            celdaVacia.style.padding = '20px';
            return;
        }

        promotoresParaMostrar.forEach(promotor => {
            const fila = cuerpoTablaPromotores.insertRow();
            fila.insertCell().textContent = `${promotor.apellidos}, ${promotor.nombres}`;
            fila.insertCell().textContent = promotor.telefono;
            fila.insertCell().textContent = promotor.codigo;
            fila.insertCell().textContent = promotor.correo;
            fila.insertCell().textContent = promotor.dni;

            const celdaAcciones = fila.insertCell();
            celdaAcciones.style.whiteSpace = 'nowrap';

            const botonEditar = document.createElement('button');
            botonEditar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M5 18.89H6.41421L15.7279 9.57629L14.3137 8.16207L5 17.4758V18.89ZM21 11.1621L12.7279 2.89H11.3137L2.46447 11.7376C2.17157 12.0305 2 12.4369 2 12.8625V18.89C2 19.4423 2.44772 19.89 3 19.89H9.02754C9.45312 19.89 9.85953 19.7184 10.1524 19.4255L18.4246 11.1534L19.8388 12.5676L18.8476 13.5588L19.5547 14.2659L21.2929 12.5278C21.6834 12.1373 21.6834 11.5041 21.2929 11.1136L19.8787 9.70001L21 8.57871V11.1621Z"></path></svg> Editar';
            botonEditar.classList.add('boton-accion', 'boton-editar');
            botonEditar.addEventListener('click', () => abrirModal('editar', promotor));
            celdaAcciones.appendChild(botonEditar);

            const botonEliminar = document.createElement('button');
            botonEliminar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 6V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7ZM9 4V6H15V4H9Z"></path></svg> Eliminar';
            botonEliminar.classList.add('boton-accion', 'boton-eliminar');
            botonEliminar.addEventListener('click', () => eliminarPromotor(promotor.id));
            celdaAcciones.appendChild(botonEliminar);
        });
    }

    // --- MANEJO DEL FORMULARIO ---
    if (formularioPromotor) {
        formularioPromotor.addEventListener('submit', function (evento) {
            evento.preventDefault();

            const datosPromotor = {
                apellidos: document.getElementById('apellidosPromotor').value.trim(),
                nombres: document.getElementById('nombresPromotor').value.trim(),
                telefono: document.getElementById('telefonoPromotor').value.trim(),
                codigo: document.getElementById('codigoPromotor').value.trim(),
                correo: document.getElementById('correoPromotor').value.trim(),
                dni: document.getElementById('dniPromotor').value.trim()
            };

            if (!datosPromotor.apellidos || !datosPromotor.nombres || !datosPromotor.telefono || !datosPromotor.codigo || !datosPromotor.correo || !datosPromotor.dni) {
                alert('Por favor, complete todos los campos del promotor.');
                return;
            }
            // Validación adicional
            if (idPromotorEnEdicion === null) {
                if (listaDePromotores.some(p => p.codigo.toLowerCase() === datosPromotor.codigo.toLowerCase())) {
                    alert('El código de promotor ingresado ya existe. Por favor, use uno diferente.');
                    return;
                }
            } else {
                if (listaDePromotores.some(p => p.codigo.toLowerCase() === datosPromotor.codigo.toLowerCase() && p.id !== idPromotorEnEdicion)) {
                    alert('El código de promotor ingresado ya existe para otro promotor. Por favor, use uno diferente.');
                    return;
                }
            }


            if (idPromotorEnEdicion !== null) {
                const indice = listaDePromotores.findIndex(p => p.id === idPromotorEnEdicion);
                if (indice !== -1) {
                    listaDePromotores[indice] = { ...datosPromotor, id: idPromotorEnEdicion };
                }
            } else {
                datosPromotor.id = proximoIdPromotor++;
                listaDePromotores.push(datosPromotor);
            }

            guardarPromotoresEnLocalStorage();
            idPromotorEnEdicion = null;
            renderizarTablaPromotores();
            cerrarModal();
        });
    }

    // --- ELIMINAR PROMOTOR ---
    function eliminarPromotor(idPromotor) {
        if (confirm('¿Está seguro de que desea eliminar este promotor? Esta acción no se puede deshacer.')) {
            listaDePromotores = listaDePromotores.filter(promotor => promotor.id !== idPromotor);
            guardarPromotoresEnLocalStorage();
            renderizarTablaPromotores();
        }
    }

    // --- BUSQUEDA ---
    if (campoBusquedaPromotor) {
        campoBusquedaPromotor.addEventListener('input', function (evento) {
            const terminoBusqueda = evento.target.value.toLowerCase().trim();
            const promotoresFiltrados = listaDePromotores.filter(promotor => {
                const nombreCompleto = `${promotor.apellidos} ${promotor.nombres}`.toLowerCase();
                const codigo = promotor.codigo.toLowerCase();
                const dni = promotor.dni.toLowerCase();
                const correo = promotor.correo.toLowerCase();

                return nombreCompleto.includes(terminoBusqueda) ||
                    codigo.includes(terminoBusqueda) ||
                    correo.includes(terminoBusqueda) ||
                    dni.includes(terminoBusqueda);
            });
            renderizarTablaPromotores(promotoresFiltrados);
        });
    }

    renderizarTablaPromotores();
});