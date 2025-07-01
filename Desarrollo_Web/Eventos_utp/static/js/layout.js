// Desarrollo_Web/Eventos_utp/static/js/layout.js (YA ESTÁ CORRECTO)

document.addEventListener("DOMContentLoaded", function () {
    const boton = document.getElementById("botonOpciones");
    const menu = document.getElementById("menuDesplegable");

    if (boton && menu) {
        boton.addEventListener("click", function (event) {
            event.stopPropagation(); // Buena práctica para evitar clics conflictivos
            menu.classList.toggle("visible");
        });

        document.addEventListener("click", function (event) {
            if (!menu.contains(event.target) && !boton.contains(event.target)) {
                menu.classList.remove("visible");
            }
        });
    }
});