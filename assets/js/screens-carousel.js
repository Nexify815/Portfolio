(function () {
  function getStep(track) {
    var card = track.querySelector(".screen-card");
    if (!card) return Math.max(280, Math.floor(track.clientWidth * 0.8));
    var style = window.getComputedStyle(track);
    var gap = parseFloat(style.columnGap || style.gap || "20") || 20;
    return Math.ceil(card.getBoundingClientRect().width + gap);
  }

  function updateButtons(track, prev, next) {
    var maxScroll = track.scrollWidth - track.clientWidth;
    var left = track.scrollLeft;
    var atStart = left <= 2;
    var atEnd = left >= maxScroll - 2;
    prev.disabled = atStart;
    next.disabled = atEnd;
    prev.setAttribute("aria-disabled", atStart ? "true" : "false");
    next.setAttribute("aria-disabled", atEnd ? "true" : "false");
  }

  function initWrap(wrap) {
    var track = wrap.querySelector(".screens-carousel");
    var prev = wrap.querySelector(".screens-carousel-btn.prev");
    var next = wrap.querySelector(".screens-carousel-btn.next");
    if (!track || !prev || !next) return;

    var sync = function () {
      updateButtons(track, prev, next);
    };

    prev.addEventListener("click", function () {
      track.scrollBy({ left: -getStep(track), behavior: "smooth" });
    });
    next.addEventListener("click", function () {
      track.scrollBy({ left: getStep(track), behavior: "smooth" });
    });

    track.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    if ("ResizeObserver" in window) {
      new ResizeObserver(sync).observe(track);
    }
    sync();
  }

  function init() {
    var wraps = document.querySelectorAll(".screens-carousel-wrap");
    for (var i = 0; i < wraps.length; i++) initWrap(wraps[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
