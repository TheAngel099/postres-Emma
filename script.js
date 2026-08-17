/* =========================================================
   CONFIGURACIÓN — edita solo estos valores
   ========================================================= */
const CONFIG = {
  // Número de WhatsApp con código de país, SIN "+" ni espacios.
  telefono: "51970725307",
  nombreNegocio: "Postres Emma",
};

/* =========================================================
   VALIDACIÓN Y UTILIDADES
   ========================================================= */
function validarTelefono(num) {
  return /^[0-9]{9,15}$/.test(num); // entre 9 y 15 dígitos
}

function crearLinkWhatsapp(producto, precio) {
  let mensaje;
  if (producto) {
    mensaje = `Hola ${CONFIG.nombreNegocio}, quiero pedir: ${producto} (S/ ${precio}). ¿Está disponible?`;
  } else {
    mensaje = `Hola ${CONFIG.nombreNegocio}, quiero hacer un pedido.`;
  }
  return `https://wa.me/${CONFIG.telefono}?text=${encodeURIComponent(mensaje)}`;
}

// Inicialización: asegurar que el teléfono sea válido
if (!validarTelefono(CONFIG.telefono)) {
  console.warn("El número de WhatsApp configurado no es válido. Revisa CONFIG.telefono.");
}

/* =========================================================
   MANEJO DE BOTONES DE WHATSAPP (genéricos y de producto)
   ========================================================= */
function abrirWhatsApp(event) {
  const el = event.currentTarget;
  const mensajeTipo = el.dataset.waMessage; // "general" o "producto"
  let url;

  if (mensajeTipo === "producto") {
    const card = el.closest(".card");
    if (!card) {
      console.warn("Botón 'Pedir' sin tarjeta padre");
      return;
    }
    const nombre = card.dataset.nombre;
    const precio = card.dataset.precio;
    if (!nombre || !precio) {
      console.warn("Faltan data-nombre o data-precio en la tarjeta");
      url = crearLinkWhatsapp();
    } else {
      url = crearLinkWhatsapp(nombre, precio);
    }
  } else {
    url = crearLinkWhatsapp();
  }

  // Abrir en la misma pestaña (más confiable que window.open)
  window.location.href = url;
  event.preventDefault();
}

// Asignar a todos los elementos con data-wa-message
document.querySelectorAll("[data-wa-message]").forEach((el) => {
  el.addEventListener("click", abrirWhatsApp);
});

/* =========================================================
   ANIMACIÓN DE TARJETAS CON INTERSECTION OBSERVER
   ========================================================= */
const observer = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("is-visible");
        observer.unobserve(entrada.target);
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll(".card").forEach((card) => observer.observe(card));

/* =========================================================
   MENÚ HAMBURGUESA
   ========================================================= */
const navToggle = document.getElementById("nav-toggle");
const nav = document.getElementById("nav");

function toggleMenu(forceState) {
  const isOpen = forceState !== undefined ? forceState : nav.classList.contains("is-open");
  if (forceState !== undefined) {
    nav.classList.toggle("is-open", forceState);
    navToggle.setAttribute("aria-expanded", forceState);
  } else {
    nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", nav.classList.contains("is-open"));
  }
}

navToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMenu();
});

// Cerrar menú al hacer clic en un enlace interno (mejora UX)
nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    if (nav.classList.contains("is-open")) toggleMenu(false);
  });
});

// Cerrar menú al hacer clic fuera de él (excepto en el botón)
document.addEventListener("click", (e) => {
  if (nav.classList.contains("is-open") &&
      !nav.contains(e.target) &&
      e.target !== navToggle &&
      !navToggle.contains(e.target)) {
    toggleMenu(false);
  }
});

/* =========================================================
   BOTÓN "VOLVER ARRIBA"
   ========================================================= */
const btnTop = document.getElementById("btn-top");

// Usamos un throttle simple para no saturar el scroll
let throttleTimer = false;
window.addEventListener("scroll", () => {
  if (throttleTimer) return;
  throttleTimer = true;
  requestAnimationFrame(() => {
    btnTop.classList.toggle("is-visible", window.scrollY > 500);
    throttleTimer = false;
  });
});

btnTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* =========================================================
   CIERRE DE MENÚ AL REDIMENSIONAR (evita que se vea roto)
   ========================================================= */
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (window.innerWidth >= 720 && nav.classList.contains("is-open")) {
      toggleMenu(false);
    }
  }, 200);
});