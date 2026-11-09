(function () {
  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function createLightbox() {
    var el = document.createElement("div");
    el.className = "screen-lightbox";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML =
      '<div class="screen-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Expanded screenshot">' +
      '  <div class="screen-lightbox-controls">' +
      '    <button type="button" class="screen-lightbox-btn" data-action="zoom-out" aria-label="Zoom out"><i class="bx bx-minus" aria-hidden="true"></i></button>' +
      '    <button type="button" class="screen-lightbox-btn" data-action="zoom-in" aria-label="Zoom in"><i class="bx bx-plus" aria-hidden="true"></i></button>' +
      '    <button type="button" class="screen-lightbox-btn" data-action="reset" aria-label="Reset zoom"><i class="bx bx-reset" aria-hidden="true"></i></button>' +
      '    <button type="button" class="screen-lightbox-btn" data-action="close" aria-label="Close"><i class="bx bx-x" aria-hidden="true"></i></button>' +
      "  </div>" +
      '  <div class="screen-lightbox-stage"><img class="screen-lightbox-img" alt="" /></div>' +
      '  <div class="screen-lightbox-caption" aria-live="polite"></div>' +
      "</div>";
    document.body.appendChild(el);
    return el;
  }

  function init() {
    var images = document.querySelectorAll(".screens-carousel .screen-card img");
    if (!images.length) return;

    var lightbox = document.querySelector(".screen-lightbox") || createLightbox();
    var stage = lightbox.querySelector(".screen-lightbox-stage");
    var img = lightbox.querySelector(".screen-lightbox-img");
    var caption = lightbox.querySelector(".screen-lightbox-caption");
    var scale = 1;
    var tx = 0;
    var ty = 0;
    var dragging = false;
    var startX = 0;
    var startY = 0;
    var startTx = 0;
    var startTy = 0;
    var lastActive = null;

    function applyTransform() {
      img.style.transform = "translate(" + tx + "px, " + ty + "px) scale(" + scale + ")";
    }

    function resetView() {
      scale = 1;
      tx = 0;
      ty = 0;
      stage.classList.remove("is-dragging");
      applyTransform();
    }

    function open(sourceImg) {
      lastActive = document.activeElement;
      img.src = sourceImg.currentSrc || sourceImg.src;
      img.alt = sourceImg.alt || "";
      var fig = sourceImg.closest("figure");
      var cap = fig ? fig.querySelector("figcaption") : null;
      caption.textContent = cap ? cap.textContent.trim() : (sourceImg.alt || "");
      caption.style.display = caption.textContent ? "" : "none";
      resetView();
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      var closeBtn = lightbox.querySelector('[data-action="close"]');
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      img.src = "";
      if (lastActive && typeof lastActive.focus === "function") {
        try { lastActive.focus(); } catch (e) {}
      }
    }

    function zoom(delta) {
      scale = clamp(Number((scale + delta).toFixed(2)), 1, 5);
      if (scale === 1) {
        tx = 0;
        ty = 0;
      }
      applyTransform();
    }

    for (var i = 0; i < images.length; i++) {
      (function (sourceImg) {
        sourceImg.setAttribute("tabindex", "0");
        sourceImg.setAttribute("role", "button");
        sourceImg.setAttribute("aria-label", "Expand image" + (sourceImg.alt ? ": " + sourceImg.alt : ""));
        sourceImg.addEventListener("click", function () { open(sourceImg); });
        sourceImg.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open(sourceImg);
          }
        });
      })(images[i]);
    }

    lightbox.addEventListener("click", function (e) {
      var actionBtn = e.target.closest("[data-action]");
      if (actionBtn) {
        var action = actionBtn.getAttribute("data-action");
        if (action === "close") close();
        if (action === "zoom-in") zoom(0.25);
        if (action === "zoom-out") zoom(-0.25);
        if (action === "reset") resetView();
        return;
      }
      if (e.target.closest(".screen-lightbox-img, .screen-lightbox-controls, .screen-lightbox-caption")) return;
      close();
    });

    stage.addEventListener("wheel", function (e) {
      if (lightbox.getAttribute("aria-hidden") !== "false") return;
      e.preventDefault();
      zoom(e.deltaY < 0 ? 0.2 : -0.2);
    }, { passive: false });

    stage.addEventListener("pointerdown", function (e) {
      if (lightbox.getAttribute("aria-hidden") !== "false" || scale <= 1) return;
      if (e.target.closest(".screen-lightbox-controls")) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startTx = tx;
      startTy = ty;
      stage.classList.add("is-dragging");
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
    });
    stage.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      tx = startTx + (e.clientX - startX);
      ty = startTy + (e.clientY - startY);
      applyTransform();
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove("is-dragging");
      try { stage.releasePointerCapture(e.pointerId); } catch (err) {}
    }
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);

    document.addEventListener("keydown", function (e) {
      if (lightbox.getAttribute("aria-hidden") !== "false") return;
      if (e.key === "Escape") close();
      if (e.key === "+" || e.key === "=") zoom(0.25);
      if (e.key === "-" || e.key === "_") zoom(-0.25);
      if (e.key === "0") resetView();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
