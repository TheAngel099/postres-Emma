(function () {
  "use strict";

  var data = window.__BRAND__ || {};
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "] fallo:", e); }
  }

  /* ===========================================================
     WhatsApp — arma el link con el mensaje ya escrito
     =========================================================== */
  function crearLinkWhatsapp(producto, precio) {
    var telefono = data.telefono || "";
    var nombreNegocio = data.nombreCompleto || data.nombre || "";
    var mensaje;
    if (producto) {
      mensaje = "Hola " + nombreNegocio + ", quiero pedir: " + producto + " (S/ " + precio + "). \u00bfEst\u00e1 disponible?";
    } else {
      mensaje = "Hola " + nombreNegocio + ", quiero hacer un pedido.";
    }
    return "https://wa.me/" + telefono + "?text=" + encodeURIComponent(mensaje);
  }

  function initWhatsapp() {
    $$("[data-whatsapp]").forEach(function (el) {
      el.setAttribute("href", crearLinkWhatsapp());
    });
    $$("[data-whatsapp-pedido]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var card = btn.closest(".card");
        var nombre = card ? card.dataset.nombre : "";
        var precio = card ? card.dataset.precio : "";
        window.open(crearLinkWhatsapp(nombre, precio), "_blank", "noopener");
      });
    });
  }

  /* ===========================================================
     Nav — hamburguesa fullscreen + header solidifica al bajar
     =========================================================== */
  function initNav() {
    var toggle = $("#nav-toggle");
    var nav = $("#nav-panel");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var abierto = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", abierto);
      document.body.style.overflow = abierto ? "hidden" : "";
    });

    $$("a", nav).forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  function initHeaderSolid() {
    var header = $("#header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-solid", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ===========================================================
     Reveal on scroll — universal, con red de seguridad a los 6s
     =========================================================== */
  function initReveals() {
    var els = $$("[data-reveal]");
    if (!els.length) return;

    if (typeof IntersectionObserver === "undefined") {
      els.forEach(function (el) { el.classList.add("is-revealed"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -2% 0px" });

    els.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      $$("[data-reveal]:not(.is-revealed)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-revealed");
        }
      });
    }, 6000);
  }

  /* ===========================================================
     Tilt 3D sutil en las tarjetas del menú (solo con mouse fino)
     =========================================================== */
  function initTilt() {
    if (!fineHover) return;
    var MAX = 6;
    $$(".card").forEach(function (card) {
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        tx = -py * MAX; ty = px * MAX;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      card.addEventListener("mouseleave", function () {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(loop);
      });

      function loop() {
        cx += (tx - cx) * 0.15;
        cy += (ty - cy) * 0.15;
        card.style.transform = "perspective(900px) rotateX(" + cx.toFixed(2) + "deg) rotateY(" + cy.toFixed(2) + "deg)";
        raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(loop) : null;
      }
    });
  }

  /* ===========================================================
     Botón volver arriba
     =========================================================== */
  function initBackToTop() {
    var btn = $("#btn-top");
    if (!btn) return;
    window.addEventListener("scroll", function () {
      btn.classList.toggle("is-visible", window.scrollY > 600);
    }, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ===========================================================
     Anclas suaves con offset (por el header fijo)
     =========================================================== */
  function initAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var top = el.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  }

  /* ===========================================================
     Marquee — efecto firma. Usa GSAP si está disponible,
     si no, la animación CSS de respaldo ya definida en styles.css
     =========================================================== */
  function initMarquee() {
    if (!window.gsap) return;
    $$("[data-marquee]").forEach(function (track) {
      var clone = track.cloneNode(true);
      clone.removeAttribute("data-marquee");
      track.parentNode.appendChild(clone);
      track.setAttribute("data-gsap-bound", "1");

      var distance = track.scrollWidth + 22; // + gap aproximado
      var speed = 55; // px/seg
      gsap.to([track, clone], {
        x: -distance,
        duration: distance / speed,
        ease: "none",
        repeat: -1,
        modifiers: { x: gsap.utils.unitize(function (x) { return parseFloat(x) % distance; }) }
      });
    });
  }

  /* ===========================================================
     Split-words en el titular del hero (solo visual, con GSAP)
     =========================================================== */
  function escHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function splitWords(el) {
    el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));
    var wrap = function (text) {
      return text.split(/(\s+)/).map(function (w) {
        return /^\s+$/.test(w) ? w : '<span class="split-word" style="display:inline-block" aria-hidden="true">' + escHTML(w) + "</span>";
      }).join("");
    };
    var html = Array.prototype.map.call(el.childNodes, function (node) {
      if (node.nodeType === 3) return wrap(node.textContent);
      if (node.nodeName === "BR") return "<br>";
      if (node.nodeType === 1) {
        var tag = node.tagName.toLowerCase();
        return "<" + tag + ">" + wrap(node.textContent) + "</" + tag + ">";
      }
      return "";
    }).join("");
    el.innerHTML = html;
    return $$(".split-word", el);
  }

  function initHeroSplit() {
    if (!window.gsap) return;
    var el = $("[data-split='words']");
    if (!el) return;
    var parts = splitWords(el);
    gsap.set(parts, { y: 22, opacity: 0 });
    gsap.to(parts, {
      y: 0, opacity: 1, duration: 0.8, stagger: 0.045, ease: "expo.out", delay: 0.15
    });
  }

  /* ===========================================================
     Boot
     =========================================================== */
  function boot() {
    safe(initWhatsapp, "initWhatsapp");
    safe(initNav, "initNav");
    safe(initHeaderSolid, "initHeaderSolid");
    safe(initReveals, "initReveals");
    safe(initTilt, "initTilt");
    safe(initBackToTop, "initBackToTop");
    safe(initAnchors, "initAnchors");
    safe(initMarquee, "initMarquee");
    safe(initHeroSplit, "initHeroSplit");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
