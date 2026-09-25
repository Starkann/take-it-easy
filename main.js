// Take It Easy · Drop 01, v3 (iPhone d'abord)
const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeRAXIo-5ImMQ70oDJS4Eqf9tK5iCcpBdAebWFijH7gV5J2zw/viewform";

const root = document.documentElement;

// Champs du formulaire pré-remplis par les choix faits sur la page
const ENTRY_SIZE = "entry.656410188";
const ENTRY_COLOR = "entry.996950959";
const choice = { size: null, color: null };

/* ---------- boutons « Commander » : lien vers le formulaire, pré-rempli si l'on a choisi ---------- */
const orderLinks = document.querySelectorAll("[data-order]");
function updateOrderLinks() {
  const params = new URLSearchParams();
  if (choice.size) params.set(ENTRY_SIZE, choice.size);
  if (choice.color) params.set(ENTRY_COLOR, choice.color);
  const url = params.toString() ? `${FORM_URL}?usp=pp_url&${params}` : FORM_URL;
  orderLinks.forEach((a) => { a.href = url; });
  const label = document.querySelector(".buy > span");
  if (label) label.textContent = choice.size ? `Commander · ${choice.size}` : "Commander";
}
orderLinks.forEach((a) => { a.target = "_blank"; a.rel = "noopener"; });
updateOrderLinks();

/* ---------- choix de la taille et vote pour la couleur ---------- */
function radioGroup(selector, key, onPick) {
  const buttons = document.querySelectorAll(selector);
  buttons.forEach((btn) => btn.addEventListener("click", () => {
    const value = btn.dataset[key];
    const same = choice[key] === value;
    choice[key] = same ? null : value;
    buttons.forEach((b) => b.setAttribute("aria-checked", String(!same && b === btn)));
    onPick?.(choice[key]);
    updateOrderLinks();
  }));
}
radioGroup(".size", "size");
radioGroup(".swatch", "color", (c) => root.classList.toggle("tint-noir", c === "Noir"));

/* ---------- découpage : mots du manifeste, lettres de « l'excuse. » ---------- */
document.querySelectorAll("[data-words]").forEach((el) => {
  el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="word">${w}</span>`).join(" ");
});
document.querySelectorAll(".drunk").forEach((el) => {
  el.innerHTML = [...el.textContent].map((c) => `<span class="ch">${c}</span>`).join("");
});

/* ---------- la nuit : barre et bouton s'inversent ; bouton flottant masqué près du prix final ---------- */
const buy = document.querySelector(".buy");
let nightFromSunset = false;
let nightFromOrder = false;
const syncNight = () => root.classList.toggle("dark-zone", nightFromSunset || nightFromOrder);

new IntersectionObserver(([e]) => { buy.classList.toggle("is-away", e.isIntersecting || e.boundingClientRect.top < 0); }, { rootMargin: "0px 0px -20% 0px" })
  .observe(document.querySelector(".order__price"));
new IntersectionObserver(([e]) => {
  nightFromOrder = e.isIntersecting || e.boundingClientRect.top < 0;
  syncNight();
}, { rootMargin: "-60px 0px -100% 0px" }).observe(document.querySelector(".order"));

/* ---------- animations ---------- */
if (!window.gsap || !window.ScrollTrigger) root.classList.add("static");

if (!root.classList.contains("static")) {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  // Entrée : le titre monte, le t-shirt tombe (c'est un drop), le badge claque
  gsap.from(".line > span", { yPercent: 105, duration: 1.1, ease: "expo.out", stagger: 0.1 });
  gsap.from(".hero__drop", { y: "-55vh", rotation: 16, duration: 1.5, ease: "back.out(1.15)", delay: 0.15 });
  gsap.from(".hero__badge", { scale: 0, rotation: -30, duration: 0.7, ease: "back.out(2)", delay: 1.2 });
  gsap.from(".bar", { autoAlpha: 0, y: -10, duration: 0.8, ease: "expo.out", delay: 0.9 });

  // Hero au scroll : le nom s'écarte, le t-shirt se redresse, le soleil tourne
  gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.4 } })
    .to(".l1 > span", { xPercent: -22, ease: "none" }, 0)
    .to(".l2 > span", { xPercent: 12, ease: "none" }, 0)
    .to(".hero__tee", { rotation: 7, scale: 1.06, ease: "none" }, 0)
    .to(".hero__sun img", { rotation: 110, ease: "none" }, 0);

  // Manifeste : les mots s'allument, le soleil roule depuis le bord
  gsap.to(".manifesto__text .word", {
    opacity: 1, stagger: 0.08, ease: "none",
    scrollTrigger: { trigger: ".manifesto__text", start: "top 82%", end: "bottom 50%", scrub: 0.3 },
  });
  gsap.fromTo(".manifesto__sun", { xPercent: 60, rotation: -90 }, {
    xPercent: 0, rotation: 30, ease: "none",
    scrollTrigger: { trigger: ".manifesto", start: "top bottom", end: "bottom 60%", scrub: 0.3 },
  });

  // Retournement : chaque face pivote seule jusqu'à 90° (jamais de texte en miroir, fiable sur Safari)
  gsap.set(".face", { transformPerspective: 1000 });
  gsap.set(".face--back", { rotationY: -90, autoAlpha: 0 });
  gsap.set(".cap--b", { autoAlpha: 0, y: 30 });
  const wobble = () => gsap.fromTo(".drunk .ch",
    { rotation: 0, y: 0 },
    { rotation: "random(-9, 9)", y: "random(-6, 6)", duration: 0.28, ease: "sine.inOut", yoyo: true, repeat: 3, stagger: 0.025, overwrite: true });
  let wobbled = false;
  gsap.timeline({
    scrollTrigger: {
      trigger: ".flip", start: "top top", end: "bottom bottom", scrub: 0.4,
      onUpdate: (self) => { if (!wobbled && self.progress > 0.62) { wobbled = true; wobble(); } },
    },
  })
    .to(".flip__sun img", { rotation: -180, ease: "none", duration: 1 }, 0)
    .to(".face--front", { rotationY: 90, ease: "power2.in", duration: 0.2 }, 0.3)
    .set(".face--front", { autoAlpha: 0 }, 0.5)
    .set(".face--back", { autoAlpha: 1 }, 0.5)
    .to(".face--back", { rotationY: 0, ease: "power2.out", duration: 0.2 }, 0.5)
    .to(".cap--a", { autoAlpha: 0, y: -40, ease: "none", duration: 0.12 }, 0.36)
    .to(".cap--b", { autoAlpha: 1, y: 0, ease: "none", duration: 0.12 }, 0.52);

  // Détails : la carte recouverte recule et s'assombrit (voile, pas de transparence)
  const cards = gsap.utils.toArray(".card");
  cards.forEach((card, i) => {
    const next = cards[i + 1];
    if (!next) return;
    gsap.to(card, {
      scale: 0.93, "--dim": 0.3, ease: "none",
      scrollTrigger: { trigger: next, start: "top bottom", end: "top 30%", scrub: 0.3 },
    });
  });

  // Coucher de soleil : la phrase se lit, puis le soleil passe sous l'horizon et la nuit tombe
  const night = getComputedStyle(root).getPropertyValue("--night").trim();
  gsap.timeline({
    scrollTrigger: {
      trigger: ".sunset", start: "top top", end: "bottom bottom", scrub: 0.4,
      onUpdate: (self) => { const n = self.progress > 0.53; if (n !== nightFromSunset) { nightFromSunset = n; syncNight(); } },
      onLeave: () => { nightFromSunset = true; syncNight(); },
      onLeaveBack: () => { nightFromSunset = false; syncNight(); },
    },
  })
    .fromTo(".sunset__sun", { scale: 1 }, { scale: 1.2, ease: "none", duration: 0.15 }, 0)
    .to(".sunset__sun", { yPercent: 85, rotation: 25, ease: "power2.in", duration: 0.37 }, 0.15)
    .set(".sunset__stage", { backgroundColor: night }, 0.535)
    .to(".sunset__text", { color: "#ECE4DD", duration: 0.01 }, 0.535)
    .to(".sunset__horizon", { backgroundColor: "#ECE4DD", duration: 0.01 }, 0.535)
    .set(".sunset__sun img", { attr: { src: "mascot-paper.png" } }, 0.535)
    .to({}, { duration: 0.4 }, 0.6);

  // Arrivée sur la commande : le t-shirt glisse, le prix monte
  gsap.from(".order__tee", { xPercent: 60, rotation: 40, ease: "expo.out", duration: 1.3, scrollTrigger: { trigger: ".order", start: "top 75%" } });
  gsap.from(".order__price", { yPercent: 25, autoAlpha: 0, ease: "expo.out", duration: 1.1, scrollTrigger: { trigger: ".order__price", start: "top 85%" } });

  addEventListener("load", () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}
