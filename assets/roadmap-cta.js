/**
 * Site-wide entry points into the free Care Navigation Starter Plan.
 *
 * Two surfaces, both deliberately quiet:
 *   1. An inline card injected into blog posts and guides, mid-article, where
 *      a reader has already shown the topic matters to them.
 *   2. A single exit-intent panel — desktop mouse-leave, or a hard scroll-up
 *      on touch. Shown once per visitor, ever, and never on the funnel itself.
 *
 * Anyone who has already requested a plan sees neither.
 */
(function () {
  var URL_ = "/free-care-roadmap/";
  var KEY_DONE = "cpp_roadmap_done";
  var KEY_SEEN = "cpp_exit_seen";

  function done() {
    try { return !!(localStorage.getItem(KEY_DONE) || localStorage.getItem("cp_subscribed")); }
    catch (e) { return false; }
  }
  if (location.pathname.indexOf("/free-care-roadmap") === 0 ||
      location.pathname.indexOf("/roadmap-on-its-way") === 0) return;

  var css = document.createElement("style");
  css.textContent =
  '.cpp-inline{background:#0b2240;border-radius:20px;padding:28px 26px;margin:34px 0;color:#fff;' +
  'font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif}' +
  '.cpp-inline .k{font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:#e3a458;font-weight:700;margin-bottom:9px}' +
  '.cpp-inline h3{font-family:"Playfair Display",Georgia,serif;font-size:22px;line-height:1.25;margin:0 0 10px;color:#fff}' +
  '.cpp-inline p{font-size:15.5px;color:#c9d6e6;margin:0 0 18px;line-height:1.6}' +
  '.cpp-inline a{display:inline-block;background:#e3a458;color:#0b2240;font-weight:700;font-size:15px;' +
  'padding:13px 26px;border-radius:999px;text-decoration:none}' +
  '.cpp-x{position:fixed;inset:0;z-index:9998;background:rgba(11,34,64,.55);display:flex;align-items:center;' +
  'justify-content:center;padding:20px;opacity:0;transition:opacity .22s}' +
  '.cpp-x.on{opacity:1}' +
  '.cpp-xc{background:#fff;border-radius:22px;max-width:440px;width:100%;padding:34px 30px;text-align:center;' +
  'font-family:Inter,-apple-system,sans-serif;box-shadow:0 30px 80px rgba(11,34,64,.4);position:relative}' +
  '.cpp-xc h3{font-family:"Playfair Display",Georgia,serif;font-size:25px;color:#0b2240;margin:0 0 12px;line-height:1.2}' +
  '.cpp-xc p{font-size:15.5px;color:#5c6b7f;margin:0 0 20px;line-height:1.6}' +
  '.cpp-xc a{display:block;background:linear-gradient(135deg,#e3a458,#d6913e);color:#0b2240;font-weight:700;' +
  'font-size:16px;padding:15px 22px;border-radius:999px;text-decoration:none}' +
  '.cpp-xc button{background:none;border:none;color:#8c9bad;font-size:14px;margin-top:14px;cursor:pointer;' +
  'font-family:inherit;text-decoration:underline}' +
  '.cpp-xc .cl{position:absolute;top:12px;right:16px;font-size:24px;color:#b9c3ce;text-decoration:none;line-height:1}';
  document.head.appendChild(css);

  /* ---- inline card, mid-article ---- */
  function inline() {
    if (done()) return;
    var art = document.querySelector("article, main .post, .post-body, main");
    if (!art) return;
    var ps = art.querySelectorAll("p");
    if (ps.length < 8) return;                       // too short to interrupt
    var at = ps[Math.floor(ps.length * 0.45)];
    if (!at || !at.parentNode) return;
    var d = document.createElement("aside");
    d.className = "cpp-inline";
    d.innerHTML =
      '<div class="k">Free · 2 minutes</div>' +
      '<h3>Get a care plan built for your child</h3>' +
      '<p>Six questions, and we send you a personalized plan — the first thing to do, the next three steps, and what to watch for. Yours to keep, no call required.</p>' +
      '<a href="' + URL_ + '">Get my free plan →</a>';
    at.parentNode.insertBefore(d, at.nextSibling);
  }

  /* ---- exit intent, once per visitor ---- */
  function exitIntent() {
    if (done()) return;
    try { if (localStorage.getItem(KEY_SEEN)) return; } catch (e) { return; }
    var fired = false;
    function show() {
      if (fired || done()) return;
      fired = true;
      try { localStorage.setItem(KEY_SEEN, "1"); } catch (e) {}
      var w = document.createElement("div");
      w.className = "cpp-x";
      w.innerHTML =
        '<div class="cpp-xc"><a href="#" class="cl" aria-label="Close">×</a>' +
        '<h3>Before you go — take the plan with you</h3>' +
        '<p>Six questions and we will send you a personalized care navigation plan for your child. Free, yours to keep, and no call required.</p>' +
        '<a href="' + URL_ + '">Get my free plan →</a>' +
        '<button type="button">No thanks</button></div>';
      document.body.appendChild(w);
      requestAnimationFrame(function () { w.classList.add("on"); });
      function close(e) { if (e) e.preventDefault(); w.remove(); }
      w.querySelector(".cl").addEventListener("click", close);
      w.querySelector("button").addEventListener("click", close);
      w.addEventListener("click", function (e) { if (e.target === w) close(); });
      document.addEventListener("keydown", function esc(e) {
        if (e.key === "Escape") { close(); document.removeEventListener("keydown", esc); }
      });
    }
    // desktop: pointer leaves the top of the viewport
    document.addEventListener("mouseout", function (e) {
      if (!e.relatedTarget && e.clientY <= 4) show();
    });
    // touch: a decisive scroll back to the top after reading a while
    var last = window.scrollY, deep = false;
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      if (y > 900) deep = true;
      if (deep && last - y > 220 && y < 420) show();
      last = y;
    }, { passive: true });
  }

  function boot() { inline(); setTimeout(exitIntent, 6000); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
