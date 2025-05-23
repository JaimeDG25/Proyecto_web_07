document.addEventListener("DOMContentLoaded", function () {
    const boton = document.getElementById("botonOpciones");
    const menu = document.getElementById("menuDesplegable");

    boton.addEventListener("click", function () {
        menu.classList.toggle("visible");
    });

    document.addEventListener("click", function (e) {
        if (!boton.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.remove("visible");
        }
    });
});
