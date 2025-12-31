import { api } from './api.js';

const $ = (s) => document.querySelector(s);

const formLogin = $("#loginForm");
const emailInput = $("#email");
const passwordInput = $("#password");

async function manejarLogin(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    //validamos
    if (!email || !password) {
        alert("Por favor, completa todos los campos");
        return;
    }

    if (!email.includes("@")){
        alert("Ingresa un email valido");
        return;
    }

    try {
        //hacer losgin
        const respuesta = await api.login(email, password);
        console.log("respuesta login:", respuesta);
        
        if (!respuesta || !respuesta.token || !respuesta.usuario){
            throw new Error("Respuesta del servidor invalida");
        }

        localStorage.setItem("token", respuesta.token);
        localStorage.setItem("user", JSON.stringify(respuesta.usuario));
        console.log("usuario guardado:", respuesta.usuario);

        const rol = respuesta.usuario.rol;
        console.log("rol de usuario", rol);

        if (rol === "TEC"){
            window.location.href = "../Inicio/dashboard_tecnico.html";
        } else if (rol === "SUPERADMIN") {
            window.location.href = "../Inicio/dashboard_SuperAdmin.html";
        } else if (rol === "ADMIN") {
            window.location.href = "../Inicio/dashboard_Admin.html";
        } else {
            alert("Rol no reconocido: " + rol);
        }

    } catch (error){
        console.error("Error en login", error)

        if (error.message.includes("401") || 
            error.message.includes("no encontrado") || 
            error.message.includes("incorrectos")) {
            alert("Email o contraseña incorrectos");
        } else {
            alert("Error: " + error.message);
        }

        if (passwordInput) passwordInput.value = "";
    }
}

if (formLogin){
    formLogin.addEventListener("submit", manejarLogin);
}

if (passwordInput){
    passwordInput.addEventListener("kespress", (e) => {
        if (e.key === "Enter"){
            manejarLogin(e);
        }
    });
}   
