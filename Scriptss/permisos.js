import { Auth } from "./auth.js";

function puedeVerPagina(pagina) {
    const rol = Auth.obtenerRol();
    const esPublico = Auth.esModoPublico();
    const paginaLower = pagina.toLowerCase();

    if (esPublico) {
        const paginasPublicas = [
            "componentes.html",
            "unidad de proceso.html",
            "entradas y salidas.html",
            "index.hmtl.html"
        ];
        return paginasPublicas.some(p => p.toLocaleLowerCase() === paginaLower);
    }

    switch(rol) {
        case "SUPERADMIN": return true;
        case "ADMIN": return !paginaLower.includes("Técnicos");
        case "TEC": 
                return paginaLower.includes("componentes") ||
                        paginaLower.includes("detallecomponente") ||
                        paginaLower.includes("unidad") ||
                        paginaLower.includes("entradas") ||
                        paginaLower.includes("dashboard_tecnico");
        default: return false;
    }
}

function redirigirSinPermisos() {
    const usuario = Auth.obtenerUsuario();

    if (!usuario) {
        window.location.href = "../login/login.hmtl";
    } else {
        const rol = usuario.rol;
        if (rol === "SUPERADMIN") {
            Window.location.href = "../Inicio/dashboard_SuperAdmin.html";
        } else if (rol === "ADMIN") {
            window.location.href = "../Inicio/dashboard_Admin.html";
        } else if (rol === "TEC") {
            window.location.href = "../Inicio/dashboard_tecnico.html";
        } else {
            window.location.href = "../index.html";
        }
    }
}

function ocultarBotonesDeAccion() {
    const botones = document.querySelectorAll('button');
    botones.forEach(boton => {
        const texto = boton.textContent || boton.innerHTML || '';
        if (texto.includes("Crear") ||
            texto.includes("Editar") ||
            texto.includes("Eliminar") ||
            texto.includes("Guardar") ||
            texto.includes("Registrar") ||
            texto.includes("Aprobar") ||
            texto.includes("Rechazar")) {
                boton.style.display = 'none';
            }
    });
}

function ocultarEnlacesDeAccion() {
    const enlaces = document.querySelectorAll('a')
    enlaces.forEach(enlace => {
        if (enlace.textContent.includes("Crear") || 
            enlace.textContent.includes("Editar")) {
                enlace.style.display = 'none';
            }
    });
}

function mostrarAccesoRestringido () {
    const contenido = document.querySelector('.caja-contenido');
    if (!contenido) return;

    const rol = Auth.obtenerRol();
    const dashboard = rol === "ADMIN" ? "Admin" : "tecnico"

    contenido.innerHTML =  `
        <div style="text-align: center; padding: 50px;">
            <h2>Acceso restringido</h2>
            <p>No tienes permisos para acceder a esta sección.</p>
            <a href="../Inicio/dashboard_${dashboard}.html" 
                class="btn" style="margin-top: 20px;">
                Volver al dashboard
            </a>
        </div>
    `;
}
//nos quedamos aki 
function configurarEnlaceCerrarSesion() {
    const usuario = Auth.obtenerUsuario();
    const cerrarSesion = document.getElementById('sesion');
    //aki
    if (!cerrarSesion) return;
    if (usuario){
            cerrarSesion.textContent = "Cerrar sesión";
            cerrarSesion.href = "#";
            cerrarSesion.onclick = (e) => {
            e.preventDefault();
            Auth.cerrarSesion();
            window.location.href = "#";
        };
    }
}

//AJUSTES POR ROL
function ajustarInterfazPublico () {
    ocultarBotonesDeAccion();
    ocultarEnlacesDeAccion();
}

function ajustarInterfazTecnico() {
    const botonCrear = document.querySelector('.btnCrear');
    const botonClaseTipo = document.querySelector('.btnclase');
    const botonMovimiento = document.querySelector('.btnmovimiento');

    if (botonCrear) botonCrear.style.display = 'none';
    if (botonClaseTipo) botonClaseTipo.style.display = 'none';
    if (botonMovimiento) botonMovimiento.style.display = 'none';

    if (window.location.pathname.includes("Técnicos")) {
        mostrarAccesoRestringido();
    }

    const dashboardTecnico = document.getElementById('dashboard');
    dashboardTecnico.href = "../Inicio/dashboard_tecnico.html";

    configurarEnlaceCerrarSesion();
}

function ajustarInterfazAdmin() {
    if (window.location.pathname.includes("Técnicos")) {
        mostrarAccesoRestringido()
    }

    const dashboardTecnico = document.getElementById('dashboard');
    dashboardTecnico.href = "../Inicio/dashboard_Admin.html";
    configurarEnlaceCerrarSesion();
}

function ajustarInterfazSuperAdmin() {
    const dashboardTecnico = document.getElementById('dashboard');
    dashboardTecnico.href = "../Inicio/dashboard_SuperAdmin.html";
    configurarEnlaceCerrarSesion();
}


function ajustarInterfazPorRol(rol) {
    switch (rol) {
        case "TEC": ajustarInterfazTecnico(); break;
        case "ADMIN": ajustarInterfazAdmin(); break;
        case "SUPERADMIN": ajustarInterfazSuperAdmin(); break;
    }
}

//FUNCIONES PARA EL MENU LATERAL 
function ajustarMenuTecnicos() {
    const rol = Auth.obtenerRol();
    const esPublico = Auth.esModoPublico();

    const itemsMenu = document.querySelectorAll('.lista li');
    itemsMenu.forEach(item => {
        const link = item.querySelector('a');
        if (link && (link.textContent.includes("Técnicos") || link.textContent.includes("tecnico"))) {
            if (esPublico || rol == "ADMIN" || rol === "TEC") {
                item.style.display = 'none';
            }
        }
    });
}

function ajustarMenuSesion() {
    const esPublico = Auth.esModoPublico();
    const enlacesMenu = document.getElementById('.lista li a');

    enlacesMenu.forEach(enlace => {
        const texto = enlace.textContent;
        if (texto.includes("Iniciar sesión") || enlace.href === "") {
            if (esPublico) {
                configurarEnlaceCerrarSesion(enlace);
            }
        }
    });
}

//FUNCIONES PRIMCIPALES
export function verificarAccesoPagina() {
    const path = window.location.pathname;
    const pagina = path.split("/").pop();

    if (pagina === "index.html" || pagina === "login.html" || !pagina) {
        return true;
    }
    const tieneAcceso = puedeVerPagina(pagina);
    if (!tieneAcceso) {
        redirigirSinPermisos();
        return false;
    }

    return true;
}

export function ajustarPaginaPorPermisos() {
    const rol = Auth.obtenerRol();
    const esPublico = Auth.esModoPublico();

    if (esPublico)  {
        ajustarInterfazPublico();
    } else {
        ajustarInterfazPorRol(rol);
    }

    ajustarMenuTecnicos();
    ajustarMenuSesion();
}