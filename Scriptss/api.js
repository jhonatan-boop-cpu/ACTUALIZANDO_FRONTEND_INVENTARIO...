const pathBase = "";

export const API = "http://localhost:3000/api" + pathBase;

function obtenerToken(){
    return localStorage.getItem("token");
}

async function req(path, opt = {}) {
    const token = obtenerToken();

    const headers = {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }),
        ...(opt.headers || {})
    };

    const r = await fetch(API + path, {
        headers,
        ...opt,
    });

    //-------------------------------------------------
    // Si hay error de autenticación
    if (r.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // Solo redirigir si no estamos en la página de login
        if (!window.location.pathname.includes("Login.html")) {
            window.location.href = "../Login/Login.html";
        }
        
        const msg = await r.text().catch(() => "");
        throw new Error(msg || `HTTP ${r.status}`);
    }
    ///----------------------------------------------------

    if(!r.ok){
        const msg = await r.text().catch(() => "");
        throw new Error(msg || `HTTP ${r.status}`);
    }
    const data = await r.json();
    return data;
}

export const api = {
    //Login
    login: (email, password) => req("/login1", { method: "POST", body: JSON.stringify({ email, password }) }),
    crearUsuario: (datos) => req("/usuario", { method: "POST", body: JSON.stringify(datos)}),
    listarUsuarios: () => req("/usuario"),
    obtenerUsuario: (id) => req(`/usuario/${id}`),
    editarUsuario: (id, datos) => req(`/usuario/${id}`,{method: "PUT", body: JSON.stringify(datos)}),
    eliminarUsuario:(id) => req(`/usuario/${id}`, {method: "DELETE"}),

    //Solicitudes
    crearSolicitud: (datos) => req("/solicitudes", {method: "POST", body: JSON.stringify(datos)}),
    listarSolicitud: () => req("/solicitudes"),
    misSolicitudes: () => req("/solicitudes/mias"),
    aprobarSolicitud: (id) => req(`/solicitudes/${id}/aprobar`,{method: "PUT"}),
    rechazarSolicitud: (id) => req(`/solicitudes/${id}/rechazar`,{method: "PUT"}),

    //Hostorial
    listarHitorial: () => req("/historial"),
    eliminarHistorial: (id) => req(`/historial/${id}`, {method: "DELETE" }),

    //Clases
    listarClases: () => req("/clase"),
    crearClase: ( nombre ) => req("/clase", { method: "POST", body: JSON.stringify({ nombre }) }),
    editarClase: (id, nombre) => req(`/clase/${id}`, { method: "PUT", body: JSON.stringify({ nombre }) }),
    eliminarClase: (id) => req(`/clase/${id}`, { method: "DELETE"}),

    //Tipos
    listarTipos: (claseId) => {
    if (claseId) {return req(`/tipo?claseId=${claseId}`);}return req("/tipo");},
    crearTipo: (nombre, claseId) => req("/tipo", {method: "POST", body: JSON.stringify({ nombre, claseId }) }),
    editarTipo: (id, nombre) => req(`/tipo/${id}`, { method: "PUT", body: JSON.stringify({ nombre}) }),
    eliminarTipo: (id) => req(`/tipo/${id}`, {method: "DELETE"}),

    //Componentes
    listarComponentes: () => req("/componentes"),
    crearComponente: (nombre, descripcion, modelo, marca, cantidad, claseId, tipoId) => req("/componente", {method: "POST", body: JSON.stringify({nombre, descripcion, modelo, marca, cantidad, claseId, tipoId}) }),
    editarComponente: (id, datos) => req(`/componente/${id}`, { method: "PUT", body: JSON.stringify(datos) }),
    eliminarComponente: (id) => req(`/componente/${id}`, {method: "DELETE"}), 
    obtenerComponente: (id) => req(`/componente/${id}`),

    //registrar Entrada
    listarEntradas: () => req("/entrada"),
    registrarEntrada: (componenteId, nombre, cantidad, motivo) => req("/entrada", {method: "POST", body: JSON.stringify({componenteId, nombre, cantidad, motivo}) }),
    editarEntrada: (id, datos) => req(`/entrada/${id}`, { method: "PUT", body: JSON.stringify(datos) }),
    eliminarEntrada: (id) => req(`/entrada/${id}`, {method: "DELETE"}), 
    obtenerEntrada: (id) => req(`/entrada/${id}`),


    //registrar Salida
    listarSalidas: () => req("/salida"),
    registrarSalida: (componenteId, cantidad, codigo, motivo, tipodeorden, responsableId, unidadId) => req
    ("/salida", {method: "POST", body: JSON.stringify({componenteId, cantidad, codigo, motivo, tipodeorden, responsableId, unidadId}) }),
    editarSalida: (id, datos) => req(`/salida/${id}`, { method: "PUT", body: JSON.stringify(datos) }),
    eliminarSalida: (id) => req(`/salida/${id}`, {method: "DELETE"}), 
    obtenerSalida: (id) => req(`/salida/${id}`),
        
    //Tecnicos
    listarTecnicos: () => req("/responsable"),
    crearTecnico: (nombre) => req("/responsable", {method: "POST", body: JSON.stringify({nombre}) }),
    editarTecnico: (id, nombre) => req(`/responsable/${id}`, { method: "PUT", body: JSON.stringify({nombre}) }),
    eliminarTecnico: (id) => req(`/responsable/${id}`, {method: "DELETE"}),

    //Unidades
    listarUnidades: () => req("/unidad"),
    crearUnidad: (nombre) => req("/unidad", {method: "POST", body: JSON.stringify({nombre}) }),
    editarUnidad: (id, nombre) => req(`/unidad/${id}`, { method: "PUT", body: JSON.stringify({nombre}) }),
    eliminarUnidad: (id) => req(`/unidad/${id}`, {method: "DELETE"}),

    //Movimientos
    listarMovimientos: () => req("/movimiento"),
};

