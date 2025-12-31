import { api } from "../Scriptss/api.js";

let idEditando = null;
let tipoEditando = null;

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

window.abrirModal = () => $("#modalEntrada").style.display = "flex";
window.cerrarModal = () => $("#modalEntrada").style.display = "none";
window.abrirModalE = () => $("#modalSalida").style.display = "flex";
window.cerrarModalE = () => $("#modalSalida").style.display = "none";

// Elementos
const filtroTipo = $("#filtroTipo");
const filtroFecha = $("#filtroFecha");
const tabla = $("#datostabla");

//FECHA Y HORA 
const parseFecha = (obj) => {
    const raw = obj.fecha || obj.createdAt || obj.created_at;
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d) ? null : d;
};
const toLocalDateStr = (d) => {
    if (!d) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

//formato de la fecha para mostrar en la tabla 
const formatFecha = (d) =>
    d ? d.toLocaleString("es-ES", { day: "numeric", month: "numeric", year: "2-digit", hour: "numeric", minute: "2-digit", hour12: true}) : "-";

// TABLA DE ENTRADA Y SALIDA
const normalizar = (item, tipo, mapaComp, mapaCodigos, mapaResp) => {
    const fecha = parseFecha(item);
    return {
        id: item.id,
        tipo,
        fecha,
        fechaISO: toLocalDateStr(fecha),
        fechaDisplay: formatFecha(fecha),
        codigo: mapaCodigos[item.componenteId] || "-",
        componente: item.componente?.nombre || mapaComp[item.componenteId] || "-",
        cantidad: item.cantidad || 0,
        persona: tipo === "Entrada" ? (item.nombre || "-") : (mapaResp[item.responsableId] || "-"),
        orden: item.tipodeorden || "-",
        observaciones: item.motivo || "-",
        componenteId: item.componenteId || (item.componente?.id || null)
    };
};

const renderTabla = (movs) => {
    const tipoSel = filtroTipo?.value;
    const fechaSel = filtroFecha?.value;

    const filtrados = movs.filter((m) =>
        (tipoSel === "todos" || m.tipo.toLowerCase() === tipoSel.toLowerCase()) &&
        (!fechaSel || m.fechaISO === fechaSel)
    );

    tabla.innerHTML = filtrados.map((m) => `
        <tr>
            <td>${m.fechaDisplay}</td>
            <td style="color:${m.tipo === "Entrada" ? "#2bb673" : "#fc1111a8"}">${m.tipo}</td>
            <td>${m.codigo}</td>
            <td>${m.componente}</td>
            <td>${m.cantidad}</td>
            <td>${m.persona}</td>
            <td>${m.orden}</td>
            <td>${m.observaciones}</td>
            <td>
                <button class="ver-btn" data-id="${m.componenteId}" data-tipo="${m.tipo}"><i class="bi bi-file-text"></i> Ver</button> 
                <button class="editar-btn" data-id="${m.id}" data-tipo="${m.tipo}"><i class="bi bi-pencil-square"></i> Editar</button>
            </td>
        </tr>   
    `).join("");
};

//CARGAR MOVIMIENTOS
async function cargarMovimientos() {
    try {
        const [entradas, salidas, comps, responsables, unidades] = await Promise.all([
            api.listarEntradas(),
            api.listarSalidas(),
            api.listarComponentes(),
            api.listarTecnicos(),
            api.listarUnidades()
        ]);
        
        ////////////
        //PARA SELECCIONAR RESPONSABLE
        const selectRespEntrada = $("#persona1");
        if (selectRespEntrada) {
            selectRespEntrada.innerHTML = responsables.map(r => 
                `<option value="${r.id}">${r.nombre}</option>`
            ).join("");
        }

        const selectRespSalida = $("#persona2");
        if (selectRespSalida) {
            selectRespSalida.innerHTML = responsables.map(r => 
                `<option value="${r.id}">${r.nombre}</option>`
            ).join("");
        }
        
        //PARA SELECCIONAR UNIDAD
        const selectUnidad = $("#unidad");
        if (selectUnidad) {
            selectUnidad.innerHTML = unidades.map(u => 
                `<option value="${u.id}">${u.nombre}</option>`
            ).join("");
        }
        ////////////

        const mapaComp = Object.fromEntries(comps.map((c) => [c.id, c.nombre]));
        const mapaCodigos = Object.fromEntries(comps.map((c) => [c.id, c.codigo]));
        const mapaResp = Object.fromEntries(responsables.map((r) => [r.id, r.nombre]));

        const movimientos = [
            ...entradas.map((e) => normalizar(e, "Entrada", mapaComp, mapaCodigos, mapaResp)),
            ...salidas.map((s) => normalizar(s, "Salida", mapaComp, mapaCodigos, mapaResp))
        ].sort((a, b) => (b.fecha || 0) - (a.fecha || 0));

        renderTabla(movimientos);
        filtroTipo?.addEventListener("change", () => renderTabla(movimientos));
        filtroFecha?.addEventListener("change", () => renderTabla(movimientos));
    } catch (err) {
        alert("Error cargando movimientos: " + err.message);
    }
}

tabla.addEventListener("click", async (e) => {
    const btn = e.target;
    
    // VER DETALLE
    if (btn.classList.contains("ver-btn")) {
        window.location.href = `../Componentes/detalleComponente.html?id=${btn.dataset.id}&tipo=${btn.dataset.tipo}`;
        return;
    }

// EDITAR ENTRADAS Y SALIDAS 
    if (btn.classList.contains("editar-btn")) {
        const id = btn.dataset.id;
        const tipo = btn.dataset.tipo;

        try {
            let movimiento;
            if (tipo === "Entrada") {
                movimiento = await api.obtenerEntrada(id);

                idEditando = id;
                tipoEditando = "Entrada";

                // llenar modal entrada
                $("#cantidad1").value = movimiento.cantidad;
                $("#persona1").value = movimiento.responsableId || movimiento.nombre || "";
                $("#obs1").value = movimiento.motivo || "";
                $("#modalEntrada").dataset.componenteId = movimiento.componenteId;

                abrirModal(); 
            } else {
                movimiento = await api.obtenerSalida(id);

                idEditando = id;
                tipoEditando = "Salida";

                // llenar modal salida
                $("#cantidad2").value = movimiento.cantidad;
                $("#persona2").value = movimiento.responsableId || "";
                $("#orden2").value = movimiento.tipodeorden || "";
                $("#obs2").value = movimiento.motivo || "";
                $("#unidad").value = movimiento.unidadId || ""; 
                $("#modalSalida").dataset.componenteId = movimiento.componenteId;

                abrirModalE();
            }
        } catch (err) {
            alert("Error cargando movimiento: " + err.message);
        }
    }
});

//FORMULARIO EDITAR ENTRADA 
document.querySelector("#modalEntrada form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        const cantidad = parseInt($("#cantidad1").value, 10);
        const personaText = $("#persona1").options[$("#persona1").selectedIndex].text; ///** */
        const obs = $("#obs1").value;
        const componenteId =parseInt ($("#modalEntrada").dataset.componenteId,10);
    
        await api.editarEntrada(idEditando, { cantidad, nombre: personaText, motivo: obs, componenteId});
        alert("Entrada actualizada correctamente");
        cerrarModal();
        cargarMovimientos();
    } catch (err) {
        alert("Error actualizando entrada: " + err.message);
    }
});

//FORMULARIO EDITAR SALIDA 
document.querySelector("#modalSalida form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        const cantidad = $("#cantidad2").value;
        const persona = $("#persona2").value;
        const orden = $("#orden2").value;
        const obs = $("#obs2").value;
        const unidadId = $("#unidad").value;
        const componenteId = parseInt($("#modalSalida").dataset.componenteId,10);

        await api.editarSalida(idEditando, { cantidad, responsableId: persona, tipodeorden: orden, motivo: obs, unidadId, componenteId});
        alert("Salida actualizada correctamente");
        cerrarModalE();
        cargarMovimientos();
    } catch (err) {
        alert("Error actualizando salida: " + err.message);
    }
});

cargarMovimientos();
