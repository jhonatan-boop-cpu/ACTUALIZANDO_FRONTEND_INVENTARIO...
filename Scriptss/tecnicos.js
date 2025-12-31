window.btnCrear = function(){
    document.getElementById("miModal").style.display = "flex";
}

window.btnCancelar = function(){
    document.getElementById("miModal").style.display = "none";
}
import { api } from "../Scriptss/api.js";

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

// Elementos del DOM
const inputNombre = $("#nombreTecnico");
const btnGuardar = $("#btnGuardarTecnico");
const datosTabla = $("#datosTecnicos");
const buscar = $("#buscarTecnico");
const tituloModal = $("#tituloModal");

// Estado
let tecnicos = [];
let editandoId = null;

// Función para poner la primera letra en mayúscula automáticamente
function autocorregirNombre(nombre) {
    return nombre
        .split(" ")
        .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
        .join(" ");
}

// Renderizar la tabla de técnicos
function renderTabla(filtro = "") {
    const filtrados = tecnicos.filter(t =>
        t.nombre.toLowerCase().includes(filtro.toLowerCase())
    );

    datosTabla.innerHTML = filtrados.map(t => `
        <tr>
            <td>${t.nombre}</td>
            <td>
                <button onclick="editarTecnico(${t.id}, '${t.nombre}')"><i class="bi bi-pencil-square"></i> Editar</button>
                <button onclick="eliminarTecnico(${t.id})"><i class="bi bi-trash"></i> Eliminar</button>
            </td>
        </tr>
    `).join("");
}

// Cargar lista de técnicos desde API
async function cargarTecnicos() {
    try {
        tecnicos = await api.listarTecnicos();
        renderTabla();
    } catch (e) {
        alert("Error al cargar técnicos: " + e.message);
    }
}

// Crear o editar técnico
btnGuardar.addEventListener("click", async () => {
    let nombre = (inputNombre.value || "").trim();
    if (!nombre) return alert("El nombre no puede estar vacío");

    // Aplicar autocorrección
    nombre = autocorregirNombre(nombre);

    try {
        if (editandoId) {
            // Editar
            await api.editarTecnico(editandoId, nombre);
            alert("Técnico editado correctamente");
            editandoId = null;
            btnGuardar.textContent = "Guardar";
            tituloModal.textContent = "Crear Técnico";
        } else {
            // Crear
            await api.crearTecnico(nombre);
            alert("Técnico creado correctamente");
        }

        inputNombre.value = "";
        cargarTecnicos();
        cerrarModal();
    } catch (e) {
        alert("Error: " + e.message);
    }
});

// Buscar mientras se escribe
buscar.addEventListener("input", (e) => {
    renderTabla(e.target.value);
});

// Funciones globales para editar y eliminar
window.editarTecnico = function (id, nombre) {
    inputNombre.value = nombre;
    editandoId = id;
    btnGuardar.textContent = "Guardar cambios";
    tituloModal.textContent = "Editar Técnico";
    btnCrear(); // abrir modal
};

window.eliminarTecnico = async function (id) {
    if (!confirm("¿Seguro que desea eliminar este técnico?")) return;
    try {
        await api.eliminarTecnico(id);
        alert("Técnico eliminado correctamente");
        cargarTecnicos();
    } catch (e) {
        alert("Error: " + e.message);
    }
};

// Funciones del modal
function btnCrear() {
    document.getElementById("miModal").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("miModal").style.display = "none";
}

// Inicializar lista
cargarTecnicos();
