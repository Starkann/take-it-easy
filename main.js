// Take It Easy · Drop 01, v2
// Lien du Google Form de commande.
const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeRAXIo-5ImMQ70oDJS4Eqf9tK5iCcpBdAebWFijH7gV5J2zw/viewform";

const root = document.documentElement;

/* ---------- boutons « Commander » ---------- */
if (FORM_URL) {
  document.querySelectorAll("[data-order]").forEach((a) => {
    a.href = FORM_URL;
    a.target = "_blank";
    a.rel = "noopener";
  });
}

/* ---------- mots du ralenti ---------- */
document.querySelectorAll("[data-words]").forEach((el) => {
  el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="word">${w}</span>`).join(" ");
});

/* ---------- scrollytelling ---------- */
if (!window.gsap || !window.ScrollTrigger) root.classList.add("static");

if (!root.classList.contains("static")) {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  // Scroll doux ; son inertie change dans la section « ralenti »
  const lenis = window.Lenis ? new Lenis({ lerp: 0.1 }) : null;
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = a.getAttribute("href");
      if (target.length < 2 || !lenis) return;
      e.preventDefault();
      lenis.scrollTo(target === "#top" ? 0 : target, { duration: 1.6 });
    });
  });

  const fg = getComputedStyle(root).getPropertyValue("--fg").trim();

  // 1. Hero : entrée, le t-shirt tombe (c'est un drop)
  gsap.from(".w", { yPercent: 50, autoAlpha: 0, duration: 1.3, ease: "expo.out", stagger: 0.09 });
  gsap.from(".hero__visual", { y: "-70vh", rotation: 14, duration: 1.6, ease: "back.out(1.1)", delay: 0.2 });
  gsap.from(".hero__sub", { autoAlpha: 0, y: 16, duration: 1, delay: 0.9, ease: "expo.out" });

  // 1. Hero au scroll : le nom éclate, le produit reste
  gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "+=140%", pin: true, scrub: 1 } })
    .to(".w1", { xPercent: -85, ease: "none" }, 0)
    .to(".w2", { xPercent: 160, ease: "none" }, 0)
    .to(".w3", { xPercent: 70, ease: "none" }, 0)
    .to(".hero__tee", { scale: 1.18, rotation: 6, ease: "none" }, 0)
    .to(".hero__sun img", { rotation: 150, ease: "none" }, 0)
    .to(".hero__sub", { autoAlpha: 0, y: -30, ease: "none", duration: 0.3 }, 0);

  // 2. Le ralenti : le texte se révèle mot à mot, le soleil se lève, le scroll devient lourd
  gsap.timeline({
    scrollTrigger: {
      trigger: ".slow", start: "top top", end: "+=200%", pin: true, scrub: 1,
      onToggle: (self) => { if (lenis) lenis.options.lerp = self.isActive ? 0.025 : 0.1; },
    },
  })
    .to(".slow__text .word", { opacity: 1, stagger: 0.1, ease: "none" }, 0)
    .fromTo(".slow__sun", { yPercent: 0 }, { yPercent: -150, rotation: 40, ease: "none" }, 0);

  // 3. Le retournement : le scroll fait pivoter le t-shirt
  gsap.set(".flip__line--b", { autoAlpha: 0, y: 40 });
  gsap.timeline({ scrollTrigger: { trigger: ".flip", start: "top top", end: "+=220%", pin: true, scrub: 1 } })
    .fromTo(".flip__card", { rotateY: 0 }, { rotateY: 180, ease: "power2.inOut", duration: 1 }, 0.1)
    .to(".flip__sun img", { rotation: -180, ease: "none", duration: 1.2 }, 0)
    .to(".flip__line--a", { autoAlpha: 0, y: -40, duration: 0.2 }, 0.45)
    .to(".flip__line--b", { autoAlpha: 1, y: 0, duration: 0.2 }, 0.6);

  // 4. Les détails : défilement horizontal, le soleil roule d'un bord à l'autre
  const track = document.querySelector(".pan__track");
  const panSun = document.querySelector(".pan__sun");
  const distance = () => track.scrollWidth - innerWidth;
  const roll = () => innerWidth - panSun.offsetWidth - panSun.offsetLeft * 2;
  gsap.timeline({
    scrollTrigger: { trigger: ".pan", start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 1, invalidateOnRefresh: true },
  })
    .to(track, { x: () => -distance(), ease: "none" }, 0)
    .to(panSun, { x: roll, rotation: () => (roll() / (Math.PI * panSun.offsetWidth)) * 360, ease: "none" }, 0);

  // 5. L'éclipse : le soleil couvre l'écran, la page passe en négatif
  gsap.timeline({ scrollTrigger: { trigger: ".eclipse", start: "top top", end: "+=180%", pin: true, scrub: 1 } })
    .to(".eclipse__text--a", { xPercent: -40, autoAlpha: 0, ease: "none", duration: 0.45 }, 0)
    .to(".eclipse__text--b", { xPercent: 40, autoAlpha: 0, ease: "none", duration: 0.45 }, 0)
    .to(".eclipse__sun", { scale: 42, rotation: 25, ease: "power3.in", duration: 1 }, 0)
    .to(".eclipse__pin", { backgroundColor: fg, ease: "none", duration: 0.12 }, 0.82)
    .to(".eclipse__sun", { autoAlpha: 0, duration: 0.06 }, 0.94);

  // Le bouton du coin s'efface quand le gros bouton « Commander » est à l'écran
  ScrollTrigger.create({ trigger: ".btn--xl", start: "top bottom", end: "bottom top", toggleClass: { targets: ".cta", className: "is-away" } });

  addEventListener("load", () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}
