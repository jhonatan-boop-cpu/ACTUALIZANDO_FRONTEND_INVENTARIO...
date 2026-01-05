export const Auth = {
    estaAutenticado() {
        return localStorage.getItem("token") !== null;
    },

    obtenerUsuario() {
        try {
            const userStr = localStorage.getItem("user");
            return userStr ? JSON.parse(userStr) : null;    
        } catch (error) {
            return null    
        }
    },

    obtenerRol() {
        const usuario = this.obtenerUsuario();
        return usuario ? usuario.rol : null;
    },

    cerrarSesion () {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "../index.html"
    }
}