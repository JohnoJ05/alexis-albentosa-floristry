/* Alexis Albentosa Floristry — shared motion engine.
   Reads data attributes already in each page's markup; it never creates elements.
     data-reveal / data-reveal="lines"  fade + rise when scrolled into view
     data-bloom                         photo opens upward inside its arch
     data-draw                          botanical line art draws itself
     data-parallax="0.06"               drifts at a different speed while scrolling
     data-marquee                       text band drifts sideways constantly (CSS loop in motion.css)
   Phones get half-strength movement; reduced-motion users get none. */
(function () {
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  if (reduce || !('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('aa-motion');

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.aaSeen = true;
        (entry.target.aaBlooms || [entry.target]).forEach(function (el) { el.classList.add('is-in'); });
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  // A closed bloom is clipped to nothing, so the observer can never see it.
  // Watch its parent instead and open every bloom inside when the parent arrives.
  function watchBloom(el) {
    var parent = el.parentElement || el;
    if (parent.aaSeen) { el.classList.add('is-in'); return; }
    if (!parent.aaBlooms) { parent.aaBlooms = []; io.observe(parent); }
    parent.aaBlooms.push(el);
  }

  var watched = typeof WeakSet === 'function' ? new WeakSet() : null;
  var parallax = [];
  var queued = false;

  function scan() {
    var nodes = document.querySelectorAll('[data-reveal], [data-bloom], [data-draw]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.classList.contains('is-in')) continue;
      if (watched) { if (watched.has(el)) continue; watched.add(el); }
      if (el.hasAttribute('data-bloom')) watchBloom(el);
      else io.observe(el);
    }
    parallax = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    requestTick();
  }

  function requestTick() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  }

  function update() {
    queued = false;
    var vh = window.innerHeight;
    var doc = document.documentElement;
    // In the design canvas the frame is as tall as the page, so nothing scrolls — keep things still there.
    var scrolls = doc.scrollHeight > vh * 1.15;
    var k = window.innerWidth < 768 ? 0.5 : 1;

    for (var i = 0; i < parallax.length; i++) {
      var el = parallax[i];
      if (!scrolls) { el.style.translate = ''; continue; }
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0.06;
      var offset = ((r.top + r.height / 2) - vh / 2) * -speed * k;
      el.style.translate = '0 ' + offset.toFixed(1) + 'px';
    }

  }

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick);

  // Pages render their content after this script loads (and re-render on interaction),
  // so pick up new elements as they appear.
  var pending = false;
  new MutationObserver(function () {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(function () { pending = false; scan(); });
  }).observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan);
  else scan();
})();
