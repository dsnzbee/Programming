// certscript.js
// runs the "certifications" section — fades/slides cards in as you scroll
// to them, and opens a full-resolution modal card when one is clicked.

(function () {
  const certcards = document.querySelectorAll(".certcard");
  const certpop = document.getElementById("certpop");
  const certpopback = document.getElementById("certpopback");
  const certpopcard = document.getElementById("certpopcard");
  const certpopimg = document.getElementById("certpopimg");
  const certpopcaption = document.getElementById("certpopcaption");
  const certpopclose = document.getElementById("certpopclose");

  if (!certcards.length) return;

  // --- entrance animation: fade/slide each card in as it scrolls into view ---
  if ("IntersectionObserver" in window) {
    const inWatcher = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("certin");
            inWatcher.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    certcards.forEach((card, i) => {
      card.style.transitionDelay = `${Math.min(i, 6) * 70}ms`;
      inWatcher.observe(card);
    });
  } else {
    certcards.forEach((card) => card.classList.add("certin"));
  }

  // --- full-resolution modal ---
  if (!certpop || !certpopimg || !certpopclose || !certpopback) return;

  let lastFocused = null;

  function openCert(card) {
    const full = card.dataset.full;
    const caption = card.dataset.caption || "";
    if (!full) return;

    lastFocused = document.activeElement;

    certpopimg.src = full;
    certpopimg.alt = caption;
    certpopcaption.textContent = caption;

    certpop.classList.add("certopen");
    certpop.setAttribute("aria-hidden", "false");
    document.body.classList.add("certlock");

    certpopclose.focus();
  }

  function closeCert() {
    certpop.classList.remove("certopen");
    certpop.setAttribute("aria-hidden", "true");
    document.body.classList.remove("certlock");

    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  certcards.forEach((card) => {
    card.addEventListener("click", () => openCert(card));
  });

  certpopclose.addEventListener("click", closeCert);
  certpopback.addEventListener("click", closeCert);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && certpop.classList.contains("certopen")) {
      closeCert();
    }
  });

  // clicking the card itself (not the image/caption) shouldn't close it —
  // only the backdrop and close button should. stop clicks on the card
  // from bubbling to the backdrop listener.
  certpopcard.addEventListener("click", (e) => e.stopPropagation());
})();