/**
 * ClearPath Pediatrics — email capture, done without walls.
 * ---------------------------------------------------------------------
 * Replaces email-popup.js, which opened a full-screen modal two seconds after
 * landing with no close button: the only way to read the page you came from
 * Google for was to hand over an email. That turned search visitors away, and
 * it is the kind of interstitial Google's page-experience guidance penalizes on
 * mobile.
 *
 * Three quieter surfaces instead, all offering the Free Care Roadmap (a plan
 * built from six answers, emailed) rather than a newsletter:
 *
 *   1. Inline card mid-article. Server-rendered on articles and topic hubs;
 *      injected here only on other long pages that lack one.
 *   2. Slide-in for engaged readers: after half the page or 40 seconds, never
 *      before 8 seconds. Bottom sheet on phones, corner card on desktop. Clear
 *      close button, Escape works, and a close keeps it away for 30 days. Also
 *      offers an email-only "RN tips" option that goes to the Klaviyo list.
 *   3. Leave-intent panel, desktop only, once per visitor.
 *
 * Nobody who has requested a plan or subscribed sees 2 or 3 again. Nothing
 * here ever appears on the funnel, the booking page or the private kits.
 */
(function () {
  if (window.__cppCapture) return;
  window.__cppCapture = true;

  var KLAVIYO_PUBLIC_KEY = "Vzcuue";   // public site ID, safe in client code
  var KLAVIYO_LIST_ID = "Wa437x";      // Welcome List (Website)
  var DAY = 864e5;
  var ROADMAP = "/free-care-roadmap/";
  var path = location.pathname;

  if (/^\/(free-care-roadmap|roadmap-on-its-way|book|kit-access|private)(\/|$)/.test(path)) return;

  /* ---------- storage, never trusted to exist ---------- */
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function within(k, ms) { var t = Number(get(k)); return t && Date.now() - t < ms; }
  function converted() { return !!(get("cpp_roadmap_done") || get("cp_subscribed")); }
  function track(name, params) { try { if (window.cpTrack) window.cpTrack(name, params || {}); } catch (e) {} }

  /* ---------- offer copy, matched to the page's topic ---------- */
  var OFFERS = {
    insurance:   ["Dealing with a denial, a bill or an approval?", "Answer six quick questions and we email you a plan for your child's situation: the first call to make and the next three steps."],
    "school-iep":["Getting ready for an IEP or 504 meeting?", "Answer six quick questions and we email you a plan: what to request beforehand, what to bring, and what to ask."],
    discharge:   ["Bringing your child home from the hospital?", "Answer six quick questions and we email you a first-weeks-home plan: the follow-ups to confirm and who owns each one."],
    organize:    ["Drowning in appointments and paperwork?", "Answer six quick questions and we email you a plan to get it organized: what to gather first and how to set it up."],
    advocate:    ["Feeling like no one is coordinating?", "Answer six quick questions and we email you a plan: who to ask to take the lead and how to keep things moving."],
    appts:       ["Want to get more out of every appointment?", "Answer six quick questions and we email you a plan: what to prepare, what to bring, and how to follow up."],
  };
  var need = (document.body && document.body.getAttribute("data-need")) || "";
  var offer = OFFERS[need] || ["Get a care plan built for your child", "Answer six quick questions and we email you a personalized plan: the first thing to do, the next three steps, and what to watch for."];
  var href = ROADMAP + (OFFERS[need] ? "?need=" + need : "");

  /* ---------- styles ---------- */
  var css = document.createElement("style");
  css.textContent =
    ".cpp-inline{background:#0b2240;border-radius:20px;padding:28px 26px;margin:34px 0;color:#fff;font-family:Inter,-apple-system,sans-serif}" +
    ".cpp-inline .k{font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:#e3a458;font-weight:700;margin-bottom:9px}" +
    ".cpp-inline h3{font-family:'Playfair Display',Georgia,serif;font-size:22px;line-height:1.25;margin:0 0 10px;color:#fff}" +
    ".cpp-inline p{font-size:15.5px;color:#c9d6e6;margin:0 0 18px;line-height:1.6}" +
    ".cpp-inline a{display:inline-block;background:#e3a458;color:#0b2240;font-weight:700;font-size:15px;padding:13px 26px;border-radius:999px;text-decoration:none}" +
    ".cpp-inline .fine{display:block;margin-top:12px;font-size:12.5px;color:#8fa3bd}" +

    ".cpp-si{position:fixed;z-index:9990;right:24px;bottom:24px;width:370px;max-width:calc(100vw - 32px);background:#fff;color:#1d2b3a;" +
    "border-radius:20px;padding:24px 24px 20px;box-shadow:0 24px 70px rgba(11,34,64,.28),0 0 0 1px rgba(11,34,64,.06);" +
    "font-family:Inter,-apple-system,sans-serif;transform:translateY(24px);opacity:0;transition:transform .32s ease,opacity .32s ease}" +
    ".cpp-si.on{transform:none;opacity:1}" +
    ".cpp-si-x{position:absolute;top:10px;right:10px;width:36px;height:36px;border:0;border-radius:50%;background:#f3eee6;color:#5c6b7f;" +
    "font-size:22px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center}" +
    ".cpp-si-x:hover{background:#ebe3d6;color:#0b2240}" +
    ".cpp-si-k{font-size:11.5px;letter-spacing:.09em;text-transform:uppercase;color:#b07a2c;font-weight:700;margin:0 40px 8px 0}" +
    ".cpp-si h3{font-family:'Playfair Display',Georgia,serif;font-size:21px;line-height:1.25;color:#0b2240;margin:0 34px 8px 0}" +
    ".cpp-si p{font-size:14.5px;line-height:1.55;color:#4a5a6b;margin:0 0 16px}" +
    ".cpp-si .cpp-si-s{display:none}" +
    ".cpp-si-go{display:block;text-align:center;background:linear-gradient(135deg,#e3a458,#d6913e);color:#0b2240;font-weight:700;" +
    "font-size:15.5px;padding:13px 18px;border-radius:999px;text-decoration:none}" +
    ".cpp-si-go:hover{filter:brightness(1.05);text-decoration:none}" +
    ".cpp-si-alt{display:block;margin:12px auto 0;background:none;border:0;color:#5c6b7f;font:inherit;font-size:13.5px;text-decoration:underline;cursor:pointer}" +
    ".cpp-si-f{margin-top:12px}" +
    ".cpp-si-f .row{display:flex;gap:8px}" +
    ".cpp-si-f input{flex:1;min-width:0;font:inherit;font-size:15px;padding:11px 14px;border:1.5px solid #e2d8c8;border-radius:12px;color:#1d2b3a;background:#fff}" +
    ".cpp-si-f input:focus{outline:none;border-color:#d6913e;box-shadow:0 0 0 3px rgba(227,164,88,.25)}" +
    ".cpp-si-f button{font:inherit;font-weight:700;font-size:14.5px;padding:11px 16px;border:0;border-radius:12px;background:#0b2240;color:#fff;cursor:pointer;white-space:nowrap}" +
    ".cpp-si-f small{display:block;margin-top:8px;font-size:12px;color:#7a8898}" +
    ".cpp-si-err{color:#b3261e;font-size:13px;margin-top:6px}" +
    ".cpp-si-ok{margin-top:12px;font-size:14.5px;color:#1f6b45;font-weight:600}" +
    ".cpp-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}" +
    "@media (max-width:640px){.cpp-si{left:0;right:0;bottom:0;width:auto;max-width:none;border-radius:20px 20px 0 0;" +
    "padding:15px 18px calc(12px + env(safe-area-inset-bottom));max-height:70vh;overflow:auto}" +
    ".cpp-si h3{font-size:17.5px;margin:0 40px 4px 0}.cpp-si p{font-size:13.5px;margin-bottom:10px}.cpp-si-k{font-size:11px;margin-bottom:4px}" +
    ".cpp-si-go{padding:12px 16px;font-size:15px}.cpp-si-x{top:8px;right:8px}" +
    // Phones get one short line instead of the full description, keeping the
    // sheet near a quarter of the screen.
    ".cpp-si .cpp-si-l{display:none}.cpp-si .cpp-si-s{display:block}.cpp-si-alt{margin-top:8px}}" +
    "@media (prefers-reduced-motion:reduce){.cpp-si{transition:none}}" +

    ".cpp-x{position:fixed;inset:0;z-index:9998;background:rgba(11,34,64,.55);display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity .22s}" +
    ".cpp-x.on{opacity:1}" +
    ".cpp-xc{background:#fff;border-radius:22px;max-width:440px;width:100%;padding:34px 30px;text-align:center;font-family:Inter,-apple-system,sans-serif;box-shadow:0 30px 80px rgba(11,34,64,.4);position:relative}" +
    ".cpp-xc h3{font-family:'Playfair Display',Georgia,serif;font-size:25px;color:#0b2240;margin:0 0 12px;line-height:1.2}" +
    ".cpp-xc p{font-size:15.5px;color:#5c6b7f;margin:0 0 20px;line-height:1.6}" +
    ".cpp-xc a.go{display:block;background:linear-gradient(135deg,#e3a458,#d6913e);color:#0b2240;font-weight:700;font-size:16px;padding:15px 22px;border-radius:999px;text-decoration:none}" +
    ".cpp-xc .no{background:none;border:none;color:#8c9bad;font-size:14px;margin-top:14px;cursor:pointer;font-family:inherit;text-decoration:underline}" +
    ".cpp-xc .cl{position:absolute;top:10px;right:10px;width:36px;height:36px;border:0;border-radius:50%;background:#f3eee6;color:#5c6b7f;font-size:22px;cursor:pointer}";
  document.head.appendChild(css);

  /* ---------- 1. inline card, only where the page did not render one ---------- */
  function inline() {
    if (converted() || document.querySelector(".cpp-inline")) return;
    if (path === "/" || path.indexOf("/tools/") === 0) return;
    var art = document.querySelector("article, main .post, .post-body, main");
    if (!art) return;
    var ps = art.querySelectorAll("p");
    if (ps.length < 8) return;
    var at = ps[Math.floor(ps.length * 0.55)];
    if (!at || !at.parentNode) return;
    var d = document.createElement("aside");
    d.className = "cpp-inline";
    d.innerHTML = '<div class="k">Free · built from your answers</div><h3></h3><p></p>' +
      '<a data-cta="roadmap-inline">Get my free plan →</a><span class="fine">Takes about two minutes. Yours to keep, no call required.</span>';
    d.querySelector("h3").textContent = offer[0];
    d.querySelector("p").textContent = offer[1];
    d.querySelector("a").setAttribute("href", href);
    at.parentNode.insertBefore(d, at.nextSibling);
  }

  /* ---------- Klaviyo, for the email-only tips option ---------- */
  function subscribe(email) {
    return fetch("https://a.klaviyo.com/client/subscriptions/?company_id=" + encodeURIComponent(KLAVIYO_PUBLIC_KEY), {
      method: "POST",
      headers: { "Content-Type": "application/json", revision: "2024-10-15" },
      body: JSON.stringify({ data: { type: "subscription", attributes: {
        custom_source: "Slide-in tips",
        profile: { data: { type: "profile", attributes: { email: email } } } },
        relationships: { list: { data: { type: "list", id: KLAVIYO_LIST_ID } } } } }),
    }).then(function (r) { return r.ok || r.status === 202; }).catch(function () { return false; });
  }

  /* ---------- 2. slide-in for engaged readers ---------- */
  var slideOpen = false;
  function slideEligible() {
    if (converted() || within("cpp_si_closed", 30 * DAY) || within("cpp_si_seen", 3 * DAY)) return false;
    if (/^\/tools\/[^/]+/.test(path)) return false;   // someone mid-way through a tool is busy
    return true;
  }
  function slideIn() {
    if (slideOpen || !slideEligible() || document.querySelector(".cpp-x")) return;
    slideOpen = true;
    set("cpp_si_seen", String(Date.now()));
    var w = document.createElement("div");
    w.className = "cpp-si";
    w.setAttribute("role", "dialog");
    w.setAttribute("aria-modal", "false");
    w.setAttribute("aria-labelledby", "cpp-si-h");
    w.innerHTML =
      '<button type="button" class="cpp-si-x" aria-label="Close">×</button>' +
      '<div class="cpp-si-k">Free · about 2 minutes</div>' +
      '<h3 id="cpp-si-h"></h3><p class="cpp-si-l"></p><p class="cpp-si-s">Six questions. A plan for your child, by email.</p>' +
      '<a class="cpp-si-go" data-cta="roadmap-slidein">Get my free plan →</a>' +
      '<button type="button" class="cpp-si-alt">Just want RN tips by email?</button>' +
      '<form class="cpp-si-f" hidden novalidate><label class="cpp-sr" for="cpp-si-e">Email address</label>' +
      '<div class="row"><input id="cpp-si-e" type="email" autocomplete="email" placeholder="you@example.com" required>' +
      '<button type="submit">Send tips</button></div>' +
      '<small>Occasional emails from ClearPath Pediatrics. Unsubscribe anytime.</small>' +
      '<div class="cpp-si-err" role="alert"></div></form>' +
      '<div class="cpp-si-ok" role="status" hidden>You’re in. Look for a welcome email shortly.</div>';
    w.querySelector("h3").textContent = offer[0];
    w.querySelector(".cpp-si-l").textContent = offer[1];
    w.querySelector(".cpp-si-go").setAttribute("href", href);
    document.body.appendChild(w);
    requestAnimationFrame(function () { requestAnimationFrame(function () { w.classList.add("on"); }); });
    track("capture_shown", { surface: "slidein", need: need || "general" });

    function close() {
      set("cpp_si_closed", String(Date.now()));
      track("capture_dismissed", { surface: "slidein" });
      document.removeEventListener("keydown", esc);
      w.classList.remove("on");
      setTimeout(function () { w.remove(); slideOpen = false; }, 320);
    }
    function esc(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", esc);
    w.querySelector(".cpp-si-x").addEventListener("click", close);
    // Signed up through another box on the page? Then this one has done its job.
    document.addEventListener("cpp:subscribed", function () {
      document.removeEventListener("keydown", esc);
      w.classList.remove("on");
      setTimeout(function () { w.remove(); slideOpen = false; }, 320);
    });

    var form = w.querySelector(".cpp-si-f");
    w.querySelector(".cpp-si-alt").addEventListener("click", function () {
      this.hidden = true; form.hidden = false; w.querySelector("input").focus();
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector("input"), err = form.querySelector(".cpp-si-err"), btn = form.querySelector("button");
      var email = input.value.trim();
      err.textContent = "";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = "Please enter a valid email address."; input.focus(); return; }
      btn.disabled = true; btn.textContent = "Sending…";
      subscribe(email).then(function (ok) {
        if (!ok) { btn.disabled = false; btn.textContent = "Send tips"; err.textContent = "That didn’t go through. Please try again."; return; }
        set("cp_subscribed", JSON.stringify({ at: new Date().toISOString(), source: "slidein" }));
        form.hidden = true; w.querySelector(".cpp-si-ok").hidden = false;
        track("tips_signup", { surface: "slidein" });
        setTimeout(function () { w.classList.remove("on"); setTimeout(function () { w.remove(); }, 320); }, 4000);
      });
    });
  }

  // An offer already on screen (the article's Roadmap card, or a sign-up box
  // marked data-capture-inline, like the homepage's) does not need a second
  // copy sliding up beneath it. Wait until it has scrolled away.
  function inlineInView() {
    var cards = document.querySelectorAll(".cpp-inline, [data-capture-inline]");
    for (var i = 0; i < cards.length; i++) {
      var r = cards[i].getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) return true;
    }
    return false;
  }

  function watchEngagement() {
    if (!slideEligible()) return;
    var start = Date.now(), fired = false;
    function fire() {
      if (fired) return;
      if (inlineInView()) { setTimeout(fire, 2500); return; }
      // A tab left open in the background should not use up the one showing.
      if (document.visibilityState === "hidden") {
        document.addEventListener("visibilitychange", function v() {
          if (document.visibilityState === "visible") { document.removeEventListener("visibilitychange", v); setTimeout(fire, 1500); }
        });
        return;
      }
      fired = true; window.removeEventListener("scroll", onScroll); slideIn();
    }
    function onScroll() {
      if (Date.now() - start < 8000) return;
      var doc = document.documentElement;
      var depth = (window.scrollY + window.innerHeight) / Math.max(doc.scrollHeight, 1);
      if (depth >= 0.5 && !inlineInView()) fire();
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    setTimeout(fire, 40000);
    // A short page can be fully read without scrolling: let time decide there.
  }

  /* ---------- 3. leave-intent, desktop only, once per visitor ---------- */
  function exitIntent() {
    if (!window.matchMedia || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (converted() || get("cpp_exit_seen") || within("cpp_si_closed", 30 * DAY)) return;
    var fired = false;
    document.addEventListener("mouseout", function (e) {
      if (fired || e.relatedTarget || e.clientY > 4 || slideOpen || converted()) return;
      fired = true;
      set("cpp_exit_seen", String(Date.now()));
      var w = document.createElement("div");
      w.className = "cpp-x";
      w.innerHTML = '<div class="cpp-xc" role="dialog" aria-modal="true" aria-labelledby="cpp-x-h">' +
        '<button type="button" class="cl" aria-label="Close">×</button>' +
        '<h3 id="cpp-x-h">Before you go, take a plan with you</h3><p></p>' +
        '<a class="go" data-cta="roadmap-exit">Get my free plan →</a>' +
        '<button type="button" class="no">No thanks</button></div>';
      w.querySelector("p").textContent = offer[1];
      w.querySelector("a.go").setAttribute("href", href);
      document.body.appendChild(w);
      requestAnimationFrame(function () { w.classList.add("on"); });
      track("capture_shown", { surface: "exit", need: need || "general" });
      function close() {
        set("cpp_si_closed", String(Date.now()));
        track("capture_dismissed", { surface: "exit" });
        document.removeEventListener("keydown", esc);
        w.remove();
      }
      function esc(e) { if (e.key === "Escape") close(); }
      document.addEventListener("keydown", esc);
      w.querySelector(".cl").addEventListener("click", close);
      w.querySelector(".no").addEventListener("click", close);
      w.addEventListener("click", function (e) { if (e.target === w) close(); });
      w.querySelector("a.go").focus();
    });
  }

  function boot() { inline(); watchEngagement(); setTimeout(exitIntent, 6000); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
