export const Auth = {

//DEFINIMOS VARIABLES PARA CADA FUNCION
    estaAutenticado: () => {
        const token = localStorage.getItem("token");
        return token !== null && token !== undefined && token !== "";
    },

    obtenerUsuario: () => {
        const userStr = localStorage.getItem("user");
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch (e){
            console.error("Error al parsear el usuario almacenado.", e);
            return null;
        }
    },

    obtenerRol: () => {
        const usuario = Auth.obtenerUsuario();
        return usuario ? usuario.rol : null;
    },

    obtenerNombre: () => {
        const usuario = Auth.obtenerUsuario();
        return usuario ? usuario.nombre : null         
    },

    cerrarSesion: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "../index.html";
    },

    tieneRol: (rolesPermitidos) => {
        const rol = Auth.obtenerRol();
        return rol && rolesPermitidos.includes(rol);
    },

//PERMISOS DE CADA USUARIO

    puede: (accion) => {
        const rol = Auth.obtenerRol();
        if (!rol) return false;

        const permisos = {
            "crear_componente": ["SUPERADMIN","ADMIN"],
            "editar_componente": ["SUPERADMIN","ADMIN"],
            "eliminar_componente": ["SUPERADMIN"],

            "crear_unidad":["SUPERADMIN","ADMIN"],
            "editar unidad":["SUPERADMIN","ADMIN"],
            "eliminar_unidad":["SUPERADMIN","ADMIN"],

            "ver_tecnico":["SUPERADMIN"],  
            "crear_tecnico":["SUPERADMIN"],
            "editar_tecnico":["SUPERADMIN"],
            "eliminar_tecnico":["SUPERADMIN"],

            "crear_clase_tipo": ["SUPERADMIN","ADMIN"],
            "editar_clase_tipo": ["SUPERADMIN","ADMIN"],
            "eliminar_clase_tipo": ["SUPERADMIN","ADMIN"],
            
            "crear_movimiento": ["SUPERADMIN","ADMIN"],
            "editar_movmiento": ["SUPERADMIN","ADMIN"],

            "crear_solicitud": ["TEC"],
            "aprobar_solicitud": ["SUPERADMIN","ADMIN"],
            };
        return permisos[accion] ? permisos[accion].includes(rol) : false;    
        },

    esModoPublico: () => {
        return !Auth.estaAutenticado();
    },

    obtenerInfo: () => {
        const usuario = Auth.obtenerUsuario();
        if (!usuario) return null;

        return{
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
            rolTexto: Auth.obtenerTextoRol(usuario.rol)
        };
    },

    obtenerTextoRol: (rol) => {
        const textos = {
            "SUPERADMIN": "Super Adiminstrador",
            "ADMIN": "Administrador",
            "TEC": "Tecnico"
        };
        return textos[rol] || rol;
    }
};