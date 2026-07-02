// endscript.js
// the footer ("endbar") sits fixed to the bottom of the viewport,
// *underneath* the rest of the page (the "lid" — #pagelid, which has
// an opaque background). the lid gets a bottom margin exactly as tall
// as the footer, so once you've scrolled all the way through the
// lid's real content, that margin is all that's left — and since a
// margin has no background of its own, the fixed footer shows through
// it, like a drawer sliding open underneath the page.
//
// the bar itself (.endbar) is always full-width and fully opaque, so
// it can never visually sit on top of anything else — it only ever
// becomes visible in the margin gap once the lid has actually scrolled
// out of the way. this script keeps that margin sized correctly (the
// footer's height can change with viewport width), and — once the
// page is scrolled all the way to the bottom — waits 1s and then pops
// the footer's inner card in with a little bounce.

(function () {
  const pagelid = document.getElementById("pagelid");
  const endbar = document.getElementById("endbar");
  const endcard = document.getElementById("endcard");
  if (!pagelid || !endbar || !endcard) return;

  const REVEAL_DELAY = 1000; // ms to wait once you hit the very bottom
  const BOTTOM_THRESHOLD = 2; // px of slack for fractional scroll values

  let footerHeight = 0;
  let revealTimer = null;
  let shown = false;

  function measure() {
    footerHeight = endbar.offsetHeight;
    pagelid.style.marginBottom = footerHeight + "px";
    checkBottom();
  }

  function isAtBottom() {
    const doc = document.documentElement;
    const scrollBottom = window.scrollY + window.innerHeight;
    return doc.scrollHeight - scrollBottom <= BOTTOM_THRESHOLD;
  }

  function show() {
    shown = true;
    endcard.classList.add("endshow");
  }

  function hide() {
    shown = false;
    endcard.classList.remove("endshow");
    if (revealTimer) {
      clearTimeout(revealTimer);
      revealTimer = null;
    }
  }

  function checkBottom() {
    if (!footerHeight) {
      hide();
      return;
    }

    if (isAtBottom()) {
      // already waiting or already shown — nothing to do
      if (shown || revealTimer) return;
      revealTimer = setTimeout(() => {
        revealTimer = null;
        show();
      }, REVEAL_DELAY);
    } else {
      hide();
    }
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      checkBottom();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", measure);
  window.addEventListener("load", measure);

  // fonts/images loading in can change the lid's height after our
  // first measurement, so re-measure a couple of times early on too.
  measure();
  setTimeout(measure, 300);
  setTimeout(measure, 1200);
})();