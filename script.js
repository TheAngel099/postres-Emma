/* =========================================================
   CONFIGURACIÓN — lo único que tu hermana necesita editar
   ========================================================= */
const CONFIG = {
  // Número de WhatsApp con código de país, SIN "+" ni espacios.
  // Ejemplo Perú: 51987654321
  telefono: "51970725307",
  nombreNegocio: "Postres Emma",
};

/* =========================================================
   Genera el link de WhatsApp con el mensaje ya escrito
   ========================================================= */
function crearLinkWhatsapp(producto, precio) {
  let mensaje;
  if (producto) {
    mensaje = `Hola ${CONFIG.nombreNegocio}, quiero pedir: ${producto} (S/ ${precio}). ¿Está disponible?`;
  } else {
    mensaje = `Hola ${CONFIG.nombreNegocio}, quiero hacer un pedido.`;
  }
  const texto = encodeURIComponent(mensaje);
  return `https://wa.me/${CONFIG.telefono}?text=${texto}`;
}

/* Botones generales (header, hero, footer) → mensaje genérico */
document.querySelectorAll("#btn-header-whatsapp, #btn-hero-whatsapp, #btn-footer-whatsapp, #btn-nav-whatsapp")
  .forEach((btn) => {
    btn.href = crearLinkWhatsapp();
  });

/* Botones "Pedir" dentro de cada tarjeta del menú → mensaje con el producto */
document.querySelectorAll(".btn-pedir").forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".card");
    const nombre = card.dataset.nombre;
    const precio = card.dataset.precio;
    window.open(crearLinkWhatsapp(nombre, precio), "_blank");
  });
});

/* =========================================================
   Animación: las tarjetas aparecen al hacer scroll hasta ellas
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
  { threshold: 0.15 }
);

document.querySelectorAll(".card").forEach((card) => observer.observe(card));

/* =========================================================
   Menú hamburguesa (solo visible en móvil)
   ========================================================= */
const navToggle = document.getElementById("nav-toggle");
const nav = document.getElementById("nav");

navToggle.addEventListener("click", () => {
  const abierto = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", abierto);
});

/* Cierra el menú al tocar un link (mejor experiencia en móvil) */
nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

/* =========================================================
   Botón "volver arriba" — aparece después de bajar un poco
   ========================================================= */
const btnTop = document.getElementById("btn-top");

window.addEventListener("scroll", () => {
  btnTop.classList.toggle("is-visible", window.scrollY > 500);
});

btnTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
