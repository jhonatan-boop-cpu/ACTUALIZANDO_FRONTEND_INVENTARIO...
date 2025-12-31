import { api } from "../Scriptss/api.js";

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

// Elementos del DOM
const inputNombreUnidad = $("#inpNombreUnidad");
const btnAgregarUnidad = $("#btnAgregarUnidad");
const datosUnidades = $("#datosUnidades");
const buscarUnidad = $("#buscarUnidad");

// Estado
let unidades = [];
let editandoId = null;

function renderTabla(filtro = "") {
    const unidadesFiltradas = unidades.filter(u =>
        u.nombre.toLowerCase().includes(filtro.toLowerCase())
    );

    datosUnidades.innerHTML = unidadesFiltradas.map(u => `
        <tr>
            <td>${u.nombre}</td>
            <td>
                <button onclick="editarUnidad(${u.id}, '${u.nombre}')"><i class="bi bi-pencil-square"></i> Editar</button>
                <button onclick="eliminarUnidad(${u.id})"><i class="bi bi-trash"></i> Eliminar</button>
            </td>
        </tr>
    `).join("");
}

// Cargar lista de unidades
async function cargarUnidades() {
    try {
        unidades = await api.listarUnidades();
        renderTabla();
    } catch (e) {
        alert("Error al cargar unidades: " + e.message);
    }
}

// Crear o editar unidad
btnAgregarUnidad.addEventListener("click", async () => {
    const nombre = (inputNombreUnidad.value || "").trim();
    if (!nombre) return alert("El nombre no puede estar vacío");

    try {
        if (editandoId) {
            // Editar
            await api.editarUnidad(editandoId, nombre);
            alert("Unidad editada correctamente");
            editandoId = null;
            btnAgregarUnidad.textContent = "Agregar";
        } else {
            // Crear
            await api.crearUnidad(nombre);
            alert("Unidad creada correctamente");
        }

        inputNombreUnidad.value = "";
        cargarUnidades();
    } catch (e) {
        alert("Error: " + e.message);
    }
});

// Buscar
buscarUnidad.addEventListener("input", (e) => {
    renderTabla(e.target.value);
});

// Hacer accesibles las funciones globalmente
window.editarUnidad = function (id, nombre) {
    inputNombreUnidad.value = nombre;
    editandoId = id;
    btnAgregarUnidad.textContent = "Guardar cambios";
};

window.eliminarUnidad = async function (id) {
    if (!confirm("¿Seguro que desea eliminar esta unidad?")) return;
    try {
        await api.eliminarUnidad(id);
        alert("Unidad eliminada");
        cargarUnidades();
    } catch (e) {
        alert("Error: " + e.message);
    }
};

// Inicializar
cargarUnidades();
