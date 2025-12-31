import { api } from "../Scriptss/api.js";
import { Auth } from "../Scriptss/auth.js";

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const inputNombre = $("#nombre");
const inputDescripcion = $("#descripcion");
const inputModelo = $("#modelo");
const inputMarca = $("#marca");
const inputCantidad = $("#cantidad");
const selectClase = $("#clase");
const selectTipo = $("#tipo");
const btnGuardar = $("#guardarComponente");
const datosTabla = $("#datostabla");
const buscarComponente = $("#buscarComponente");

//PARA EDITAR
const inputNombreE = $("#nombreE");
const inputDescripcionE = $("#descripcionE");
const inputModeloE = $("#modeloE");
const inputMarcaE = $("#marcaE");
const inputCantidadE = $("#cantidadE");
const btnGuardarE = $("#guardarCambiosE");
let componentesId = null;

function configurarPermisosEnPagina(){
    const rol = Auth.obtenerRol();
    const esPublico = !Auth.estaAutenticado();
    
    console.log("configurando permisos en componentes - Rol", rol);

    const botonCrear = $('.btncrear');
    const botonClaseTipo = $('.btnclase');
    const botonMovimiento = $('.btnmovimiento');

    if (esPublico || rol === "TEC") {
        if (botonCrear) botonCrear.style.display = "none";
        if (botonClaseTipo) botonClaseTipo.style.display = "none";
        if (botonMovimiento) botonMovimiento.style.display = "none";
    }
}

//LLAMAR CLASES Y TIPOS
async function cargarClasesTipos() {
    try {
        const clases = await api.listarClases().catch(() => []);

        if (selectClase) {
            selectClase.innerHTML = `<option disabled selected></option>`+
                clases.map(c => `<option value = "${c.id}">${c.nombre}</option>`).join("");   //value = "${c.id} ==> envia por id a la bd tal como lo pide el backend
        }
        if (selectTipo) {
            selectTipo.innerHTML = `<option disabled selected></option>`;
        }

    } catch (error) {
        console.error("Error cargando clases:", error);
    }
}

selectClase?.addEventListener("change", async () => {
    const claseId = selectClase.value;
    if (!claseId) return;

    try {
        const tipos = await api.listarTipos(claseId).catch(() => []);
        if (selectTipo) {
            selectTipo.innerHTML = `<option disabled selected>seleccione un tipo</option>`+
            tipos.map(t => `<option value = "${t.id}">${t.nombre}</option>`).join("");    
        }
    } catch (error) {
        console.error("Error cargando tipos:", error);    
    }
    
});


//cargar tabla de componentes con permisos para cada usuario   
async function cargarTabla(filtro = "") {
    try {
        const componentes = await api.listarComponentes().catch(() => []);
        const filtrados = componentes.filter(c =>
            c.nombre.toLowerCase().includes(filtro.toLowerCase())
        );

        const rol = Auth.obtenerRol();
        const esPublico = !Auth.estaAutenticado();

        //mostrar tabla HTML
        datosTabla.innerHTML = filtrados.map(c => {
            let botonesHTML = '';

            if (!esPublico) {
                if (rol === "ADMIN") {
                    botonesHTML = ` <button onclick = "event.stopPropagation(); editarComponente(${c.id})">
                                    <i class = "bi bi-pencil-square"></i> Editar 
                                    </button> `;
                }
                else if (rol === "SUPERADMIN") {
                    botonesHTML = ` <button onclick = "event.stopPropagation(); editarComponente(${c.id})">
                                    <i class = "bi bi-pencil-square"></i> Editar 
                                    </button>
                                    <button onclick = "event.stopPropagation(); eliminarComponente(${c.id})">
                                    <i class = "bi bi-trash"></i> Eliminar 
                                    </button> `;
                }

            }
            return ` <tr onclick = "window.location.href = 'detalleComponente.html?id=${c.id}'" style = "cursor: pointer;">
                        <td>${c.nombre}</td>
                        <td>${c.codigo}</td>
                        <td>${c.cantidad}</td>
                        <td>${c.modelo}</td>
                        <td>${botonesHTML}</td>
                    </tr> `;
        }).join("");

        const hayBotones = !esPublico && (rol === "ADMIN" || rol === "SUPERADMIN");

        if (!hayBotones) {
            const thAcciones = document.querySelector('.th th:nth-child(5)');
            if (thAcciones) thAcciones.style.display = 'none';

            const celdasAcciones = document.querySelectorAll('#datostabla td:nth-child(5)');
            celdasAcciones.forEach(celda => celda.style.display = 'none');
        }

    } catch (error) {
        console.error("Error cargando tabla:", error);
        datosTabla.innerHTML = `<tr><td colspan = "5"> Error al cargar componentes </td></tr>`;
    }
}
//buscar componente 
buscarComponente?.addEventListener("input", (e) => {
    cargarTabla(e.target.value);
});
    

//crear componente     
btnGuardar?.addEventListener("click", async () => {
    const rol = Auth.obtenerRol();

    if (rol !== "ADMIN" && rol !== "SUPERADMIN") {
        alert("No tienes permisos para crear componentes");
        cerrarModal();
        return;
    }

    try {
        const nombre = (inputNombre.value || "").trim();
        const descripcion = (inputDescripcion.value || "").trim();
        const modelo = (inputModelo.value || "").trim();
        const marca = (inputMarca.value || "").trim();
        const cantidad = (inputCantidad.value || "").trim();
        const claseId = selectClase.value;
        const tipoId = selectTipo.value;

        if (!nombre || !descripcion || !modelo || !marca || !cantidad || !claseId || !tipoId){
            return alert("Todos los campos son obligatorios");
            
        }

        await api.crearComponente(nombre, descripcion, modelo, marca, cantidad, claseId, tipoId);
        alert("Componente guardado");

        //limpiar modal
        inputNombre.value = "";
        inputDescripcion.value = "";
        inputModelo.value = "";
        inputMarca.value = "";
        inputCantidad.value = "";
        selectClase.value = 0;
        selectTipo.value = 0;
        
        cerrarModal();
        cargarTabla();
    } catch (e) {
        alert("Error: " + e.message);
    }
});

//ELIMINAR COMPONENTE
window.eliminarComponente = async function(id){
    const rol = Auth.obtenerRol();

    if (rol !== "SUPERADMIN"){
        alert("Solo el SuperAdmin puede eliminar componentes");
        return; 
    }
    if (!confirm("Seguro que desea eliminar el componente?")) return;

    try {
        await api.eliminarComponente(id);
        alert("Componente eliminado");
        cargarTabla();    
    } catch (e) {
        alert ("Error: " + e.message);        
    }
};

//EDITAR COMPONENTE
window.editarComponente = async function(id) {
    const rol = Auth.obtenerRol();

    if (rol !== "ADMIN" && rol !== "SUPERADMIN") {
        alert("No tienes permisos para editar componentes");
        return;
    }

    try {
        componentesId = id;
        const componente = await api.listarComponentes();
        const comp = componente.find((c) => c.id === id);

        if (!comp){
            alert("Componente no encontrado");
            return
        }

        inputNombreE.value = comp.nombre;
        inputDescripcionE.value = comp.descripcion; 
        inputModeloE.value = comp.modelo;
        inputMarcaE.value = comp.marca;
        inputCantidadE.value = comp.cantidad;

        abrirModalE();
        
    } catch (error) {
        alert("Error al cargar componente" + error.message);
    }
};

//para guardar lo editado
btnGuardarE?.addEventListener("click", async () => {    //(?) ==> solo ejecuta si en la pagina lo requiere
    const rol = Auth.obtenerRol();

    if (rol !== "ADMIN" && rol !== "SUPERADMIN") {
        alert ("no tienes permisos para editar componentes");
        cerrarModalE();
        return;
    }

    const nombre = (inputNombreE.value || "").trim();
    const descripcion = (inputDescripcionE.value || "").trim();
    const modelo = (inputModeloE.value || "").trim();
    const marca = (inputMarcaE.value || "").trim();
    const cantidad = (inputCantidadE.value || "").trim();

    try {
        await api.editarComponente(componentesId, {nombre, descripcion, modelo, marca, cantidad});
        alert("Componente editado exitosamente");

        componentesId = null;
        cargarTabla();
        cerrarModalE();

    } catch (e) {
        alert("Error:" + e.message);
    }
});

//DETALLE DEL COMPONENTE
const detalleCodigo = $("#detalleCodigo");
const detalleNombre = $("#detalleNombre");
const detalleClase = $("#detalleClase");
const detalleTipo = $("#detalleTipo");
const detalleModelo = $("#detalleModelo");
const detalleMarca = $("#detalleMarca");
const detalleCantidad = $("#detalleCantidad");
const detalleDescripcion = $("#detalleDescripcion");

// Obtener id de la URL (?id=123)
const params = new URLSearchParams(window.location.search);
const componenteId = params.get("id");

// Solo ejecutar si existe el elemento y hay id
if (detalleCodigo && componenteId) {
    cargarDetalle(componenteId);
}



async function cargarDetalle(id) {
    try {
        const componente = await api.obtenerComponente(id);

        if (!componente) return alert("Componente no encontrado");

        const claseNombre = componente.clase?.nombre || "";
        const tipoNombre = componente.tipo?.nombre || "";

        detalleCodigo.textContent = componente.codigo || "";
        detalleNombre.textContent = componente.nombre || "";
        detalleClase.textContent = claseNombre;
        detalleTipo.textContent = tipoNombre;
        detalleModelo.textContent = componente.modelo || "";
        detalleMarca.textContent = componente.marca || "";
        detalleCantidad.textContent = componente.cantidad || "";
        detalleDescripcion.value = componente.descripcion || "";

    } catch (e) {
        alert("Error cargando detalle: " + e.message);
        console.error(e);
    }
    cargarHistorial(id);
}

function Fecha(raw) {
    if (!raw) return "-";
    const d = new Date(raw);
    if (isNaN(d)) return String(raw);
    return d.toLocaleString("es-ES", {
        day: "numeric",
        month: "numeric",
        year: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
}

async function cargarHistorial(id) {
    
    const detalleHistorial = $("#detalleHistorial");
    if (!detalleHistorial) 
        return;
    try {
        const [entradas, salidas, responsables, unidades] = await Promise.all([
            api.listarEntradas().catch(() => []),
            api.listarSalidas().catch(() => []),
            api.listarTecnicos().catch(() => []),
            api.listarUnidades().catch(() => [])
        ]);

        const mapaResp = Object.fromEntries(responsables.map(r => [r.id, r.nombre]));
        const mapaUnidades = Object.fromEntries(unidades.map(u => [u.id, u.nombre]));


        const entradasComp = entradas.filter(e => e.componenteId == id)
            .map(e => {
                const fechaRaw = e.fecha || e.createdAt || null;
                return {
                fechaRaw,
                fecha: Fecha(fechaRaw),
                tipo: "Entrada",
                cantidad: e.cantidad,
                persona: e.nombre || "-",
                unidadProceso: "-",
                ordenTrabajo: "-",
                motivo: e.motivo || ""
                };
            });
        
        const salidasComp = salidas.filter(s => s.componenteId == id)
            .map(s => {
                const fechaRaw = s.fecha || s.createdAt || null;
                return {
                fechaRaw,
                fecha: Fecha(fechaRaw),
                tipo: "Salida",
                cantidad: s.cantidad,
                persona: mapaResp[s.responsableId] || "-",
                unidadProceso: mapaUnidades[s.unidadId] || "-",
                ordenTrabajo: s.tipodeorden || "-",
                motivo: s.motivo || ""
                }
            });

        const historial = [...entradasComp, ...salidasComp].sort((a, b) => new Date(b.fechaRaw) - new Date(a.fechaRaw));

        detalleHistorial.innerHTML = historial.map(h => `
            <tr>
                <td>${h.fecha}</td>
                <td style="color:${h.tipo === "Entrada" ? "#2bb673" : "#fc1111a8"}">${h.tipo}</td>
                <td>${h.cantidad}</td>
                <td>${h.persona}</td>
                <td>${h.unidadProceso}</td>
                <td>${h.ordenTrabajo}</td>
                <td>${h.motivo}</td>
            </tr>
        `).join("");
    } catch (e) {
        alert("Error cargando historial: " + e.message);
        console.error("Error cargando historial: ", e);
        detalleHistorial.innerHTML = `<tr><td colspan="7">No hay historial</td></tr>`
    }
}
//Abrir modal
window.abrirModal = function(){
    const rol = Auth.obtenerRol();
    if (rol !== "ADMIN" && rol !== "SUPERADMIN") {
        alert("no tienes permisos para crear componentes");
        return;
    }
    document.getElementById('mimodal').style.display = 'flex';
}
//Cerrar modal
window.cerrarModal = function(){
    document.getElementById('mimodal').style.display = 'none'; 
}
window.abrirModalE = function(){
    document.getElementById('mimodalE').style.display = 'flex';
};
//Cerrar modal
window.cerrarModalE = function(){
    document.getElementById('mimodalE').style.display = 'none'; 
};

document.addEventListener('DOMContentLoaded', function() {
    console.log("Iniciando pagina de componentes");

    configurarPermisosEnPagina();
    cargarTabla();
    cargarClasesTipos();
});
