import { Auth } from "./auth.js";  
import { verificarAccesoPagina, ajustarPaginaPorPermisos } from "./permisos.js";

/* FUNCION BOTON HAMBURGUESA */ 
const btn = document.getElementById("menuBtn");
const menu = document.querySelector(".fondo_menu");

if (btn && menu) {
    btn.addEventListener("click", () => {
        menu.classList.toggle("open");
    });
}

// Función principal
function inicializarPagina() {
    console.log("=== INICIANDO PÁGINA ===");
    console.log("Rol actual:", Auth.obtenerRol());
    console.log("¿Autenticado?:", Auth.estaAutenticado());
    
    // 1. Verificar acceso a la página
    const tieneAcceso = verificarAccesoPagina();
    
    if (!tieneAcceso) {
        console.log("No tiene acceso a esta página");
        return;
    }
    
    // 2. Ajustar interfaz según permisos
    ajustarPaginaPorPermisos();
    
    console.log("=== PÁGINA INICIALIZADA ===");
}

// Ejecutar cuando cargue el DOM
document.addEventListener("DOMContentLoaded", inicializarPagina);