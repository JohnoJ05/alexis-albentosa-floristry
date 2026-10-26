/* Alexis Albentosa Floristry — site behaviour
   (Scroll reveals, blooming photos and other motion live in motion.js.) */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scrollBehavior = reduceMotion ? 'auto' : 'smooth';
  var desktop = window.matchMedia('(min-width: 1024px)');

  /* ---------- Menu drawer (phones and tablets) ---------- */
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
    desktop.addEventListener('change', close);

    drawer.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
      if (e.key !== 'Tab') return;
      var items = drawer.querySelectorAll('a[href], button:not([disabled])');
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    drawer.querySelectorAll('[data-locations]').forEach(function (link) {
      link.addEventListener('click', function () { close(); });
    });
  }

  /* ---------- "Locations": glide to the section when it's on this page ---------- */
  function initLocations() {
    var target = document.getElementById('based');
    if (!target) return;
    document.querySelectorAll('[data-locations]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        setTimeout(function () { target.scrollIntoView({ behavior: scrollBehavior, block: 'start' }); }, 60);
        if (history.replaceState) history.replaceState(null, '', '#based');
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

  /* ---------- About: background tabs (phones) ---------- */
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

  /* ---------- Portfolio: filter + swipe / grid (phones), staggered grid (desktop) ---------- */
  // Small hand-drawn botanicals tucked between photos on desktop. `note` is the line under the drawing ('' for none).
  var GALLERY_ICONS = [
    { ink: '#b4505f', note: 'Natural & whimsical', d: ['M15 44c4-10 9-22 19-36', 'M21 33c-6 1-10-1-12-5 5-2 9 0 12 5z', 'M26 24c1-6 4-9 9-10 0 5-3 8-9 10z', 'M29.5 17c-5-1-8-4-8.2-8 4 .2 7.2 3.2 8.2 8z'] },
    { ink: '#e99063', note: '', d: ['M24 44V22', 'M24 36c-6-1-9-5-10-10 5 1 9 4 10 10z', 'M17 11c0 7 3 11 7 11s7-4 7-11l-3.5 3.5L24 8l-3.5 6.5z', 'M24 30c4-1 6-4 7-7'] },
    { ink: '#7a5778', note: 'Movement & colour', d: ['M23 25c0 6 1 12 1 19', 'M24 21c-2.5 0-3.5-2.5-1.8-4s5-.8 5 2.4-3.5 5.6-7.4 4.8-5.6-5-3.6-8.4 7-4.4 10-1.6 3 8 0 11', 'M23.5 34c5-1 8-4 9-8-5 1-8 4-9 8z'] },
    { ink: '#8e988c', note: '', d: ['M10 42C20 32 30 21 39 7', 'M17 34c-1-6 1-10 6-12 1 6-1 10-6 12z', 'M25 25c-1-6 1-10 6-12 1 6-1 10-6 12z', 'M21 30c5 0 9 3 10 8-5 0-9-3-10-8z'] }
  ];
  var PARALLAX_SPEEDS = [0.03, 0.08, 0.05, 0.1, 0.04];

  function initPortfolio(carousels) {
    var section = document.querySelector('[data-portfolio]');
    var dataEl = document.getElementById('gallery-data');
    if (!section || !dataEl) return;
    var items = JSON.parse(dataEl.textContent);
    var track = section.querySelector('[data-track]');
    var filters = Array.prototype.slice.call(section.querySelectorAll('[data-filter]'));
    var viewBtn = section.querySelector('.view-toggle');
    var viewLabel = viewBtn.querySelector('[data-view-label]');
    var swipeBar = section.querySelector('[data-swipe-bar]');
    var moreBtn = section.querySelector('[data-more]');
    var countLabel = section.querySelector('[data-count]');
    var carousel = carousels.get(section);
    var state = { filter: 'All', grid: false, limit: 24 };

    function photo(it, i, isDesk, inSwipe) {
      var fig = document.createElement('figure');
      fig.className = 'photo work-item' + (i % 3 === 1 ? ' is-arch' : '') + (i % 2 === 1 ? ' is-drop' : '');
      fig.setAttribute('data-cat', it.cat);
      fig.setAttribute('data-bloom', '');
      if (inSwipe) fig.setAttribute('data-slide', '');
      if (isDesk) fig.setAttribute('data-parallax', String(PARALLAX_SPEEDS[i % 5]));
      var img = document.createElement('img');
      img.src = it.src;
      img.alt = it.alt;
      img.loading = 'lazy';
      fig.appendChild(img);
      return fig;
    }

    function icon(ic, i) {
      var cell = document.createElement('div');
      cell.className = 'work-icon' + (i % 2 === 1 ? ' is-drop' : '');
      cell.setAttribute('aria-hidden', 'true');
      cell.innerHTML =
        '<svg data-draw data-sway width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="' + ic.ink + '" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">' +
        ic.d.map(function (d) { return '<path pathLength="1" d="' + d + '"/>'; }).join('') + '</svg>' +
        (ic.note ? '<p data-reveal style="color: ' + ic.ink + '">' + ic.note.replace('&', '&amp;') + '</p>' : '');
      return cell;
    }

    function render() {
      var isDesk = desktop.matches;
      var list = items.filter(function (it) { return state.filter === 'All' || it.cat === state.filter; });
      var mode = isDesk ? 'is-desk' : (state.grid ? 'is-grid' : 'is-swipe');
      var limited = isDesk || state.grid;
      var shown = limited ? list.slice(0, state.limit) : list;

      track.className = 'work-track ' + mode;
      track.innerHTML = '';
      if (isDesk) {
        var cells = [], iconN = 0;
        shown.forEach(function (it, n) {
          if (n > 0 && n % 8 === 6) cells.push({ icon: GALLERY_ICONS[iconN++ % GALLERY_ICONS.length] });
          cells.push({ photo: it });
        });
        cells.forEach(function (c, i) { track.appendChild(c.icon ? icon(c.icon, i) : photo(c.photo, i, true, false)); });
      } else {
        shown.forEach(function (it, i) { track.appendChild(photo(it, i, false, mode === 'is-swipe')); });
      }

      var left = list.length - shown.length;
      moreBtn.hidden = !(limited && left > 0);
      moreBtn.textContent = 'Show more · ' + left + ' to go';
      swipeBar.hidden = mode !== 'is-swipe';
      countLabel.textContent = list.length + (list.length === 1 ? ' piece' : ' pieces');
      viewBtn.setAttribute('aria-pressed', state.grid ? 'true' : 'false');
      viewLabel.textContent = state.grid ? 'Swipe view' : 'See all';
      if (carousel) carousel.reset();
    }

    function baseLimit() { return desktop.matches ? 20 : 24; }

    filters.forEach(function (f) {
      f.addEventListener('click', function () {
        state.filter = f.getAttribute('data-filter');
        state.limit = baseLimit();
        filters.forEach(function (o) { o.setAttribute('aria-pressed', o === f ? 'true' : 'false'); });
        render();
      });
    });
    viewBtn.addEventListener('click', function () { state.grid = !state.grid; state.limit = baseLimit(); render(); });
    moreBtn.addEventListener('click', function () { state.limit += baseLimit(); render(); });
    desktop.addEventListener('change', function () { state.limit = baseLimit(); render(); });

    state.limit = baseLimit();
    render();
  }

  /* ---------- Enquire: the form opens a pre-filled email ---------- */
  function sendEnquiry(form) {
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
      '',
      'Ideas:',
      v('ideas'),
      '',
      'Heard about me via: ' + v('heard')
    ].join('\n');
    var to = form.getAttribute('data-email');
    window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  // Phones and tablets: three steps
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
      sendEnquiry(form);
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

  // Desktop: one page
  function initEnquiryDesk() {
    var form = document.querySelector('[data-enquiry-desk]');
    if (!form) return;
    var thanks = document.querySelector('[data-thanks-desk]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      sendEnquiry(form);
      form.hidden = true;
      thanks.hidden = false;
    });

    thanks.querySelector('[data-reset]').addEventListener('click', function () {
      form.reset();
      thanks.hidden = true;
      form.hidden = false;
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initDrawer();
    initLocations();
    var carousels = new Map();
    document.querySelectorAll('[data-carousel]').forEach(function (s) { carousels.set(s, initCarousel(s)); });
    initTabs();
    initPortfolio(carousels);
    initEnquiry();
    initEnquiryDesk();
  });
})();
