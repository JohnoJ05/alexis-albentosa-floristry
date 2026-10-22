/* Alexis Albentosa Floristry — site behaviour */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scrollBehavior = reduceMotion ? 'auto' : 'smooth';

  /* ---------- Menu drawer ---------- */
  function initDrawer() {
    var toggle = document.querySelector('[aria-controls="site-drawer"]');
    var drawer = document.getElementById('site-drawer');
    if (!toggle || !drawer) return;
    var root = document.documentElement;
    var closeBtn = drawer.querySelector('.drawer__close');

    var page = document.body.getAttribute('data-page');
    var here = page && drawer.querySelector('[data-nav="' + page + '"]');
    if (here) here.setAttribute('aria-current', 'page');

    function setOpen(open) {
      root.classList.toggle('is-menu-open', open);
      document.body.classList.toggle('is-locked', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      setTimeout(function () { (open ? closeBtn : toggle).focus(); }, 60);
    }
    function close() { if (root.classList.contains('is-menu-open')) setOpen(false); }

    toggle.addEventListener('click', function () { setOpen(!root.classList.contains('is-menu-open')); });
    document.querySelectorAll('[data-drawer-close]').forEach(function (el) { el.addEventListener('click', close); });

    drawer.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
      if (e.key !== 'Tab') return;
      var items = drawer.querySelectorAll('a[href], button:not([disabled])');
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    // "Locations" — glide to the section when it's on this page.
    drawer.querySelectorAll('[data-locations]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var target = document.getElementById('based');
        if (!target) return;
        e.preventDefault();
        setOpen(false);
        setTimeout(function () { target.scrollIntoView({ behavior: scrollBehavior, block: 'start' }); }, 60);
      });
    });
  }

  /* ---------- Swipe carousels ---------- */
  function initCarousel(section) {
    var track = section.querySelector('[data-track]');
    if (!track) return null;
    var prev = section.querySelector('[data-prev]');
    var next = section.querySelector('[data-next]');
    var counter = section.querySelector('[data-counter]');
    var dotsBox = section.querySelector('[data-dots]');
    var index = 0;

    function slides() {
      return Array.prototype.filter.call(track.querySelectorAll('[data-slide]'), function (s) { return !s.hidden; });
    }
    function pad(n) { return String(n).padStart(2, '0'); }

    function render() {
      var list = slides();
      var count = list.length;
      index = Math.min(index, Math.max(count - 1, 0));
      if (prev) prev.disabled = index === 0;
      if (next) next.disabled = index >= count - 1;
      if (counter) counter.textContent = pad(index + 1) + ' / ' + pad(count);
      if (dotsBox) {
        if (dotsBox.children.length !== count) {
          dotsBox.innerHTML = '';
          for (var d = 0; d < count; d++) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'dot';
            b.setAttribute('aria-label', 'Show item ' + (d + 1));
            b.appendChild(document.createElement('span'));
            b.addEventListener('click', goTo.bind(null, d));
            dotsBox.appendChild(b);
          }
        }
        Array.prototype.forEach.call(dotsBox.children, function (b, k) {
          b.setAttribute('aria-current', k === index ? 'true' : 'false');
        });
      }
    }

    function goTo(d) {
      var list = slides();
      if (list[d]) track.scrollTo({ left: list[d].offsetLeft - list[0].offsetLeft, behavior: scrollBehavior });
    }

    function onScroll() {
      var list = slides();
      if (!list.length) return;
      var origin = list[0].offsetLeft;
      var best = 0, bestDist = Infinity;
      list.forEach(function (s, k) {
        var dist = Math.abs(s.offsetLeft - origin - track.scrollLeft);
        if (dist < bestDist) { bestDist = dist; best = k; }
      });
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) best = list.length - 1;
      if (best !== index) { index = best; render(); }
    }

    track.addEventListener('scroll', onScroll, { passive: true });
    if (prev) prev.addEventListener('click', function () { goTo(Math.max(index - 1, 0)); });
    if (next) next.addEventListener('click', function () { goTo(Math.min(index + 1, slides().length - 1)); });
    render();

    return {
      reset: function () { index = 0; track.scrollTo({ left: 0 }); render(); }
    };
  }

  /* ---------- About: timeline tabs ---------- */
  function initTabs() {
    var list = document.querySelector('[role="tablist"]');
    if (!list) return;
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    var nextBtn = document.querySelector('[data-tab-next]');
    var current = 0;

    function select(k, focus) {
      current = k;
      tabs.forEach(function (t, i) {
        var on = i === k;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tabs[k].focus();
      if (nextBtn) nextBtn.textContent = k < tabs.length - 1 ? 'Next chapter →' : '← Back to the start';
    }

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') select((i + 1) % tabs.length, true);
        if (e.key === 'ArrowLeft') select((i - 1 + tabs.length) % tabs.length, true);
      });
    });
    if (nextBtn) nextBtn.addEventListener('click', function () { select((current + 1) % tabs.length); });
    select(0);
  }

  /* ---------- About: services accordion (one open at a time) ---------- */
  function initAccordion() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.accordion__btn'));
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var opening = btn.getAttribute('aria-expanded') !== 'true';
        buttons.forEach(function (b) {
          var on = opening && b === btn;
          b.setAttribute('aria-expanded', on ? 'true' : 'false');
          document.getElementById(b.getAttribute('aria-controls')).hidden = !on;
        });
      });
    });
  }

  /* ---------- Portfolio: filter + swipe/grid toggle ---------- */
  function initPortfolio(carousels) {
    var section = document.querySelector('[data-portfolio]');
    if (!section) return;
    var track = section.querySelector('[data-track]');
    var items = Array.prototype.slice.call(track.querySelectorAll('.work-item'));
    var filters = Array.prototype.slice.call(section.querySelectorAll('.filter'));
    var viewBtn = section.querySelector('.view-toggle');
    var viewLabel = viewBtn.querySelector('[data-view-label]');
    var bar = section.querySelector('.carousel__bar');
    var carousel = carousels.get(section);

    function layout() {
      var visible = items.filter(function (it) { return !it.hidden; });
      visible.forEach(function (it, i) {
        it.classList.toggle('is-arch', i % 3 === 1);
        it.classList.toggle('is-offset', i % 2 === 1);
      });
      if (carousel) carousel.reset();
    }

    filters.forEach(function (f) {
      f.addEventListener('click', function () {
        var cat = f.getAttribute('data-filter');
        filters.forEach(function (o) { o.setAttribute('aria-pressed', o === f ? 'true' : 'false'); });
        items.forEach(function (it) { it.hidden = !(cat === 'All' || it.getAttribute('data-cat') === cat); });
        layout();
      });
    });

    viewBtn.addEventListener('click', function () {
      var grid = !track.classList.contains('is-grid');
      track.classList.toggle('is-grid', grid);
      viewBtn.setAttribute('aria-pressed', grid ? 'true' : 'false');
      viewLabel.textContent = grid ? 'Swipe view' : 'See all';
      bar.hidden = grid;
      layout();
    });

    layout();
  }

  /* ---------- Enquire: three-step form → email ---------- */
  function initEnquiry() {
    var form = document.querySelector('[data-enquiry]');
    if (!form) return;
    var wrap = document.querySelector('[data-enquiry-wrap]');
    var thanks = document.querySelector('[data-thanks]');
    var steps = Array.prototype.slice.call(form.querySelectorAll('[data-step]'));
    var bars = document.querySelectorAll('.progress-bars span');
    var title = document.querySelector('[data-step-title]');
    var count = document.querySelector('[data-step-count]');
    var back = form.querySelector('[data-back]');
    var submit = form.querySelector('[type="submit"]');
    var titles = ['About you', 'Your day', 'Your ideas'];
    var step = 0;

    function render() {
      steps.forEach(function (s, i) { s.hidden = i !== step; });
      Array.prototype.forEach.call(bars, function (b, i) { b.classList.toggle('is-done', i <= step); });
      title.textContent = titles[step];
      count.textContent = 'Step ' + (step + 1) + ' of ' + steps.length;
      back.disabled = step === 0;
      submit.textContent = step < steps.length - 1 ? 'Next →' : 'Send enquiry →';
    }

    function stepValid() {
      var els = steps[step].querySelectorAll('input, select, textarea');
      for (var k = 0; k < els.length; k++) {
        if (!els[k].checkValidity()) { els[k].reportValidity(); return false; }
      }
      return true;
    }

    function focusFirst() {
      setTimeout(function () {
        var el = steps[step].querySelector('input:not([type=radio]), textarea, select');
        if (el) el.focus();
      }, 30);
    }

    back.addEventListener('click', function () { if (step > 0) { step--; render(); } });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!stepValid()) return;
      if (step < steps.length - 1) { step++; render(); focusFirst(); return; }

      var f = form.elements;
      var v = function (n) { return f[n] && f[n].value ? f[n].value : '-'; };
      var subject = v('type') + ' enquiry from ' + v('name') + (v('date') !== '-' ? ' (' + v('date') + ')' : '');
      var body = [
        'Name: ' + v('name'),
        'Email: ' + v('email'),
        'Phone: ' + v('phone'),
        'Enquiry: ' + v('type'),
        'Date: ' + v('date'),
        'Venue: ' + v('venue'),
        'Guests: ' + v('guests'),
        'Budget: ' + v('budget'),
        '',
        'Ideas:',
        v('ideas'),
        '',
        'Heard about me via: ' + v('heard')
      ].join('\n');
      var to = form.getAttribute('data-email');
      window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      wrap.hidden = true;
      thanks.hidden = false;
    });

    thanks.querySelector('[data-reset]').addEventListener('click', function () {
      form.reset();
      step = 0;
      render();
      thanks.hidden = true;
      wrap.hidden = false;
    });

    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initDrawer();
    var carousels = new Map();
    document.querySelectorAll('[data-carousel]').forEach(function (s) { carousels.set(s, initCarousel(s)); });
    initTabs();
    initAccordion();
    initPortfolio(carousels);
    initEnquiry();
  });
})();
