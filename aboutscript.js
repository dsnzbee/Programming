// aboutscript.js
// runs the "about" section — pins the image + text panel while you scroll
// through it, swaps which image/text chunk is showing, and flips which
// side the image sits on for alternating layers.
//
// note: this pins the panel manually with JS (fixed/absolute toggling)
// instead of using CSS position:sticky. the page sets overflow-x:hidden
// on html/body, which breaks native position:sticky in some browsers
// (Safari in particular), so this sidesteps that entirely.

(function () {
  const abwrap = document.querySelector(".abwrap");
  const abstick = document.getElementById("abstick");
  if (!abwrap || !abstick) return;

  const abimgs = abstick.querySelectorAll(".abimg");
  const abchunks = abstick.querySelectorAll(".abchunk");
  const abtriggers = document.querySelectorAll(".abtrigger");

  const mobileQuery = window.matchMedia("(max-width: 860px)");

  let currentStep = 0;
  let ticking = false;

  function goToStep(step) {
    if (step === currentStep) return;
    currentStep = step;

    abstick.dataset.step = String(step);

    abimgs.forEach((img, i) => {
      img.classList.toggle("abshow", i === step);
    });

    abchunks.forEach((chunk, i) => {
      chunk.classList.toggle("abshow", i === step);
    });
  }

  // --- pinning (skipped entirely on mobile, where the CSS just stacks things) ---
  // the panel is vertically centered in the viewport while pinned (see
  // .abpinned in the CSS), so the trigger points are anchored to the
  // viewport's center rather than a fixed top offset.
  function updatePin() {
    if (mobileQuery.matches) {
      abstick.classList.remove("abpinned", "abparked");
      abstick.style.left = "";
      abstick.style.width = "";
      return;
    }

    const rect = abwrap.getBoundingClientRect();
    const stickHeight = abstick.offsetHeight;
    const center = window.innerHeight / 2;
    const pinnedTop = center - stickHeight / 2;
    const pinnedBottom = center + stickHeight / 2;

    if (rect.top > pinnedTop) {
      // haven't reached it yet — sits at the top of the wrap
      abstick.classList.remove("abpinned", "abparked");
      abstick.style.left = "";
      abstick.style.width = "";
    } else if (rect.bottom < pinnedBottom) {
      // scrolled past it — park at the bottom of the wrap
      abstick.classList.remove("abpinned");
      abstick.classList.add("abparked");
      abstick.style.left = "";
      abstick.style.width = "";
    } else {
      // currently inside it — pin to the viewport, centered
      const cs = getComputedStyle(abwrap);
      const padLeft = parseFloat(cs.paddingLeft) || 0;
      const padRight = parseFloat(cs.paddingRight) || 0;

      abstick.classList.add("abpinned");
      abstick.classList.remove("abparked");
      abstick.style.left = rect.left + padLeft + "px";
      abstick.style.width = rect.width - padLeft - padRight + "px";
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updatePin();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updatePin();

  // --- step switching, based on which trigger is in view ---
  if (abtriggers.length && "IntersectionObserver" in window) {
    const watcher = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const step = Number(entry.target.dataset.step);
            if (!Number.isNaN(step)) goToStep(step);
          }
        });
      },
      { threshold: 0.5 }
    );

    abtriggers.forEach((trigger) => watcher.observe(trigger));
  }
})();