// --- MENSAJE DE PRUEBA DE CARGA ---
console.log("¡colegio.js cargado y ejecutándose!"); 

document.addEventListener('DOMContentLoaded', function () {
    // --- MANEJO DE BARRA LATERAL (se mantiene igual) ---
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

    // --- MANEJO DE COLEGIOS (Refactorizado para interactuar con Django) ---
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

    // Obtener el token CSRF para las solicitudes AJAX
    const getCsrfToken = () => {
        // Asegúrate de que el input oculto con el token CSRF esté en tu formulario HTML
        const csrfInput = document.querySelector('[name=csrfmiddlewaretoken]');
        if (csrfInput) {
            return csrfInput.value;
        }
        console.error("CSRF token no encontrado. Asegúrate de incluir {% csrf_token %} en tu formulario.");
        return '';
    };

    // --- FUNCIONES DEL MODAL DE COLEGIO ---
    function abrirModal(modo = 'nuevo', colegio = null) {
        if (!formularioColegio || !modalGestionColegio || !tituloModalColegio || !idColegioEditarInput || !inputFileBd || !nombreArchivoActualInfo) {
            console.error("Faltan elementos del DOM para el modal de colegio.");
            return;
        }
        formularioColegio.reset();
        nombreArchivoActualInfo.textContent = '';
        nombreArchivoActualInfo.style.display = 'none';
        idColegioEditarInput.value = ''; // Limpiar el ID oculto

        // Reiniciar el input de archivo
        inputFileBd.value = null;

        if (modo === 'editar' && colegio) {
            tituloModalColegio.textContent = 'Editar Colegio';
            idColegioEditarInput.value = colegio.id; // Establecer el ID para edición
            document.getElementById('nombreColegio').value = colegio.nombre;
            // Asegúrate de que el select de promotores ya esté poblado por Django en el HTML
            if (selectPromotorColegio) {
                selectPromotorColegio.value = colegio.promotor_id || ''; // Seleccionar el promotor guardado
            }
            document.getElementById('apellidosEncargadoColegio').value = colegio.apellidos_encargado;
            document.getElementById('nombreEncargadoColegio').value = colegio.nombres_encargado;
            document.getElementById('telefonoEncargadoColegio').value = colegio.telefono_encargado;
            document.getElementById('distritoColegio').value = colegio.distrito;
            document.getElementById('linkUbicacionColegio').value = colegio.link_ubicacion || '';

            if (colegio.archivo_excel_name) { // Usar el nombre del archivo del backend
                nombreArchivoActualInfo.textContent = `Archivo actual: ${colegio.archivo_excel_name}`;
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
        idColegioEditarInput.value = ''; // Limpiar el ID oculto
        if (inputFileBd) inputFileBd.value = null; // Limpiar el input de archivo
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
                const archivoSeleccionado = evento.target.files[0];
                nombreArchivoActualInfo.textContent = `Archivo seleccionado: ${archivoSeleccionado.name}`;
                nombreArchivoActualInfo.style.display = 'block';
            } else {
                // Si se deselecciona el archivo, mostrar el nombre del archivo actual si estamos editando
                const colegioId = idColegioEditarInput.value;
                if (colegioId) {
                    // Para simplificar, si se deselecciona, asumimos que no hay nuevo archivo
                    // y el backend mantendrá el anterior si es una edición.
                    nombreArchivoActualInfo.textContent = 'No se ha seleccionado un nuevo archivo.';
                    nombreArchivoActualInfo.style.display = 'block';
                } else {
                    nombreArchivoActualInfo.textContent = '';
                    nombreArchivoActualInfo.style.display = 'none';
                }
            }
        });
    }

    // --- RENDERIZAR TABLA DE COLEGIOS (Ahora con datos del backend) ---
    function renderizarTablaColegios(colegiosParaMostrar = []) {
        if (!cuerpoTablaColegios) return;
        cuerpoTablaColegios.innerHTML = '';

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

            // El promotor_nombre_completo ya viene del backend
            fila.insertCell().textContent = colegio.promotor_nombre_completo || '-';

            fila.insertCell().textContent = `${colegio.apellidos_encargado}, ${colegio.nombres_encargado}`;
            fila.insertCell().textContent = colegio.telefono_encargado;
            fila.insertCell().textContent = colegio.distrito;

            const celdaUbicacion = fila.insertCell();
            if (colegio.link_ubicacion) {
                const enlace = document.createElement('a');
                enlace.href = colegio.link_ubicacion;
                enlace.textContent = 'Ver Mapa';
                enlace.target = '_blank';
                enlace.rel = 'noopener noreferrer';
                celdaUbicacion.appendChild(enlace);
            } else {
                celdaUbicacion.textContent = '-';
            }

            const celdaArchivo = fila.insertCell();
            if (colegio.archivo_excel_url) {
                const enlaceArchivo = document.createElement('a');
                enlaceArchivo.href = colegio.archivo_excel_url;
                enlaceArchivo.textContent = colegio.archivo_excel_name || 'Descargar';
                enlaceArchivo.target = '_blank';
                enlaceArchivo.rel = 'noopener noreferrer';
                celdaArchivo.appendChild(enlaceArchivo);
            } else {
                celdaArchivo.textContent = 'No adjunto';
            }


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

    // --- CARGAR COLEGIOS DESDE EL BACKEND ---
    async function cargarColegios(searchTerm = '') {
        try {
            const url = searchTerm ? `/Evento/api/colegios/?search=${encodeURIComponent(searchTerm)}` : '/Evento/api/colegios/';
            console.log("Intentando cargar colegios desde:", url); // Log de la URL de la API
            const response = await fetch(url);
            
            if (!response.ok) { // Verifica si la respuesta HTTP fue exitosa (código 2xx)
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
            }

            const data = await response.json();
            console.log("Datos recibidos de la API:", data); // Log de los datos recibidos

            if (data.success) {
                renderizarTablaColegios(data.colegios);
            } else {
                console.error('Error al cargar colegios (API response):', data.message);
                alert('Error al cargar colegios: ' + data.message);
            }
        } catch (error) {
            console.error('Error de red o JSON al cargar colegios:', error);
            alert('Ocurrió un error de red o al procesar los datos de los colegios.');
        }
    }

    // --- MANEJO DEL FORMULARIO (Crear/Editar) ---
    if (formularioColegio) {
        formularioColegio.addEventListener('submit', async function (evento) {
            evento.preventDefault();

            const formData = new FormData(formularioColegio);
            const csrfToken = getCsrfToken();
            if (csrfToken) {
                formData.append('csrfmiddlewaretoken', csrfToken); // Añadir el token CSRF
            } else {
                alert("Error de seguridad: CSRF token no encontrado. La solicitud no se enviará.");
                return;
            }

            const url = '/Evento/colegios/'; // La misma URL de la vista de colegios
            console.log("Intentando guardar colegio en:", url); // Log de la URL de guardado

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    body: formData, // FormData se encarga de Content-Type: multipart/form-data
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
                }

                const data = await response.json();
                console.log("Respuesta de guardado:", data);

                if (data.success) {
                    alert(data.message); 
                    cerrarModal();
                    cargarColegios(campoBusquedaColegio.value); // Recargar la tabla con la búsqueda actual
                } else {
                    alert('Error al guardar el colegio: ' + data.message); 
                }
            } catch (error) {
                console.error('Error en la solicitud AJAX (guardar colegio):', error);
                alert('Ocurrió un error de red o del servidor al guardar el colegio.');
            }
        });
    }

    // --- ELIMINAR COLEGIOS ---
    async function eliminarColegio(idColegio) {
        if (confirm('¿Está seguro de que desea eliminar este colegio? Esta acción no se puede deshacer.')) {
            try {
                const url = `/Evento/api/colegios/delete/${idColegio}/`;
                console.log("Intentando eliminar colegio en:", url); // Log de la URL de eliminación
                const response = await fetch(url, {
                    method: 'POST', 
                    headers: {
                        'X-CSRFToken': getCsrfToken(), // Enviar CSRF para DELETE/POST
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({}) 
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
                }

                const data = await response.json();
                console.log("Respuesta de eliminación:", data);

                if (data.success) {
                    alert(data.message);
                    cargarColegios(campoBusquedaColegio.value); 
                } else {
                    alert('Error al eliminar el colegio: ' + data.message);
                }
            } catch (error) {
                console.error('Error en la solicitud AJAX (eliminar colegio):', error);
                alert('Ocurrió un error de red o del servidor al eliminar el colegio.');
            }
        }
    }

    // --- BUSQUEDA DE COLEGIOS ---
    if (campoBusquedaColegio) {
        campoBusquedaColegio.addEventListener('input', function (evento) {
            const terminoBusqueda = evento.target.value.trim();
            cargarColegios(terminoBusqueda); 
        });
    }

    // --- INICIALIZACIÓN ---
    // Cargar colegios al inicio
    cargarColegios();
});
