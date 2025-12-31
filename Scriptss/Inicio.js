import { api } from "../Scriptss/api.js";

class DashboardData {
    constructor() {
        this.init();
    }

    init() {
        this.loadRealTimeData();
        setInterval(() => this.loadRealTimeData(), 5000);
    }

    async loadRealTimeData() {
        try {
            await Promise.all([
                this.loadTotalComponentes(),
                this.loadTotalMovimientos(),
                this.loadEntradasHoy(),
                this.loadSalidasHoy()
            ]);
        } catch (error) {
            console.error('Error cargando datos:', error);
        }
    }

    async loadTotalComponentes() {
        try {
            const componentes = await api.listarComponentes();
            document.getElementById('total-componentes').textContent = componentes.length;
        } catch (error) {
            console.error('Error cargando total componentes:', error);
            document.getElementById('total-componentes').textContent = '0';
        }
    }

    async loadTotalMovimientos() {
        try {
            const [entradas, salidas] = await Promise.all([
                api.listarEntradas(),
                api.listarSalidas()
            ]);
            document.getElementById('total-movimientos').textContent = entradas.length + salidas.length;
        } catch (error) {
            console.error('Error cargando movimientos:', error);
            document.getElementById('total-movimientos').textContent = '0';
        }
    }

    async loadEntradasHoy() {
        try {
            const entradas = await api.listarEntradas();
            const hoy = new Date().toISOString().split('T')[0];
            const entradasHoy = entradas.filter(entrada => {
                const fecha = new Date(entrada.createdAt || entrada.fecha).toISOString().split('T')[0];
                return fecha === hoy;
            }).length;
            document.getElementById('entradas-hoy').textContent = entradasHoy;
        } catch (error) {
            console.error('Error cargando entradas hoy:', error);
            document.getElementById('entradas-hoy').textContent = '0';
        }
    }
    //salidas de hoy 
    async loadSalidasHoy() {
        try {
            const salidas = await api.listarSalidas();
            const hoy = new Date().toISOString().split('T')[0];
            const salidasHoy = salidas.filter(salida => {
                const fecha = new Date(salida.createdAt || salida.fecha).toISOString().split('T')[0];
                return fecha === hoy;
            }).length;
            document.getElementById('salidas-hoy').textContent = salidasHoy;
        } catch (error) {
            console.error('Error cargando salidas hoy:', error);
            document.getElementById('salidas-hoy').textContent = '0';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    new DashboardData();
});