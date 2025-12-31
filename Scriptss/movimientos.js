import { api } from "../Scriptss/api.js";

const $ = (s) => document.querySelector(s);

const selectMovimiento = $("#tipoMovimiento");
const selectComponente = $("#selectComponente");
const inputCantidad = $("#cantidad");
const inputNombre = $("#nombrePersona");
const inputCodigo = $("#codigo");
const selectTipoOrden = $("#tipoOrden");
const textareaMotivo = $("#motivo");
const btnGuardar = $("#guardarMovimiento");
const selectUnidad = $("#unidad");
const selectResponsable = $("#responsable");


if (selectMovimiento) {
    const page = window.location.pathname;

    if (page.includes("Entrada.html")) {
        selectMovimiento.value = "Entrada.html";
    } else if (page.includes("Salida.html")) {
        selectMovimiento.value = "Salida.html";
    }
    
    selectMovimiento.addEventListener("change", () => {
        if (selectMovimiento.value) {
        window.location.href = selectMovimiento.value;
        }
    });
    }

async function cargarComponentes() {
    if (!selectComponente) return;
    try {
        const componentes = await api.listarComponentes();
        selectComponente.innerHTML = `
        <option value ="" disabled selected></option>    
        ${componentes.map((c) => `<option value="${c.id}">${c.nombre}</option>`).join("")}
        `;
    } catch (e) {
        alert("Error al cargar componentes: " + e.message);
    }
    }

async function cargarUnidades() {
    if (!selectUnidad) return;
    try {
        const unidades = await api.listarUnidades();
        selectUnidad.innerHTML = `
        <option value ="" disabled selected></option>    
        ${unidades.map((u) => `<option value="${u.id}">${u.nombre}</option>`).join("")}
        `;
    } catch (e) {
        alert("Error al cargar unidades: " + e.message);
    }
    }

async function cargarResponsables() {
    if (!selectResponsable) return;
    try {
        const responsables = await api.listarTecnicos();
        selectResponsable.innerHTML = `
        <option value ="" disabled selected></option>    
        ${responsables.map((r) => `<option value="${r.id}">${r.nombre}</option>`).join("")}
        `;
    } catch (e) {
        alert("Error al cargar responsables: " + e.message);
    }
    }

btnGuardar?.addEventListener("click", async () => {
    const page = window.location.pathname;      ///

    const componenteId = selectComponente?.value;
    const cantidad = inputCantidad?.value;
    const motivo = textareaMotivo?.value?.trim();

    try {

//registrar entrada
        if (page.includes("Entrada.html")) {
        const nombre = inputNombre?.value?.trim();
        if (!componenteId || !cantidad || !nombre)
            return alert("Faltan campos obligatorios para la entrada");
        await api.registrarEntrada(componenteId, nombre, cantidad, motivo);
        alert("Entrada registrada correctamente");
        
//registrar salida
        } else if (page.includes("Salida.html")) {
        const codigo = inputCodigo?.value?.trim();
        const tipodeorden = selectTipoOrden?.value;
        const responsableId = selectResponsable?.value;
        const unidadId = selectUnidad?.value;

        if (!componenteId || !cantidad || !codigo || !tipodeorden || !responsableId || !unidadId)
            return alert("Faltan campos obligatorios para la salida");

        await api.registrarSalida(componenteId, cantidad, codigo, motivo, tipodeorden, responsableId, unidadId);
        alert("Salida registrada correctamente");
        }
/////STOCK 
        const componente = await api.obtenerComponente(componenteId);
        $("#stockLabel").textContent = `Stock actual: ${componente.cantidad}`;
/////---------
        // limpiar
        if (inputCantidad) inputCantidad.value = "";
        if (inputNombre) inputNombre.value = "";
        if (inputCodigo) inputCodigo.value = "";
        if (textareaMotivo) textareaMotivo.value = "";

        if (selectComponente) selectComponente.selectedIndex = 0;
        if (selectUnidad) selectUnidad.selectedIndex = 0;
        if (selectResponsable) selectResponsable.selectedIndex = 0;

        

    } catch (e) {
        alert("Error al registrar movimiento: " + e.message);
    }
});

//MOSTRAR STOCK
selectComponente?.addEventListener("change", async () => {
    const id = selectComponente.value;
    if (!id) return;

    try {
        const componente = await api.obtenerComponente(id);

        // Mostrar label con stock
        $("#stockContainer").style.display = "block";
        $("#stockLabel").textContent = `Stock actual: ${componente.cantidad}`;
    } catch (err) {
        console.error("Error obteniendo stock", err);
        $("#stockLabel").textContent = "Error cargando stock";
    }
});

cargarComponentes();
cargarUnidades();
cargarResponsables();
