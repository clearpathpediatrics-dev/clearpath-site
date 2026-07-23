/* =====================================================================
   ClearPath Pediatrics — shared email-capture popup (all pages)
   ---------------------------------------------------------------------
   Same rules as the homepage popup: appears after 2s, requires an email
   (no close until they submit), and remembers via localStorage so anyone
   who has already subscribed ANYWHERE on the site is never asked again.
   Include with: <script src="/assets/email-popup.js" defer></script>
   ===================================================================== */
(function () {
  // The homepage ships its own inline popup (#cpModal). Never double up.
  if (document.getElementById("cpModal")) return;

  var KLAVIYO_PUBLIC_KEY = "Vzcuue";              // ClearPath public/site ID
  var KLAVIYO_LIST_ID    = "Wa437x";              // Welcome List (Website)
  var DELAY_MS = 2000;
  var SOURCE = location.pathname.indexOf("/blog") === 0 ? "Blog Popup" : "Site Popup";

  function alreadySubscribed() {
    try { return !!(localStorage.getItem("cp_subscribed") || localStorage.getItem("cp_popup_seen")); }
    catch (e) { return false; }
  }
  function markSubscribed(email) {
    try { localStorage.setItem("cp_subscribed", JSON.stringify({ email: email || "", at: new Date().toISOString() })); }
    catch (e) {}
  }
  // Recognize returning subscribers — don't ask again.
  if (alreadySubscribed()) return;

  var CSS =
  ".cpp-modal{position:fixed;inset:0;z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(8,26,48,.72);-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);opacity:0;visibility:hidden;transition:opacity .35s,visibility .35s;font-family:'Inter',system-ui,-apple-system,sans-serif}" +
  ".cpp-modal.open{opacity:1;visibility:visible}" +
  ".cpp-card{position:relative;width:100%;max-width:460px;border-radius:24px;padding:42px 38px 30px;text-align:center;background:radial-gradient(600px 300px at 80% -10%,rgba(227,164,88,.2),transparent 60%),linear-gradient(160deg,#102a4d,#081a30);color:#fff;box-shadow:0 40px 100px rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.1);transform:translateY(26px) scale(.97);transition:transform .4s cubic-bezier(.22,.61,.36,1)}" +
  ".cpp-modal.open .cpp-card{transform:none}" +
  ".cpp-logo{height:62px;width:auto;margin:0 auto 18px;display:block}" +
  ".cpp-eyebrow{font-weight:700;font-size:.72rem;letter-spacing:.22em;text-transform:uppercase;color:#e3a458;display:inline-block;margin-bottom:10px}" +
  ".cpp-card h3{font-family:'Playfair Display',Georgia,serif;font-size:1.65rem;color:#fff;margin-bottom:10px;line-height:1.18}" +
  ".cpp-card p{color:rgba(255,255,255,.82);font-size:.96rem;margin-bottom:22px}" +
  ".cpp-form{display:flex;flex-direction:column;gap:10px}" +
  ".cpp-form input{padding:15px 18px;border-radius:12px;border:1.5px solid rgba(255,255,255,.2);background:rgba(255,255,255,.96);color:#1d2b3a;font-size:1rem;font-family:inherit}" +
  ".cpp-form input:focus{outline:none;border-color:#e3a458;box-shadow:0 0 0 4px rgba(227,164,88,.25)}" +
  ".cpp-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5em;width:100%;font-weight:600;font-size:1rem;padding:15px 24px;border-radius:999px;border:none;cursor:pointer;color:#fff;background:linear-gradient(135deg,#e3a458,#d6913e);box-shadow:0 12px 30px rgba(214,145,62,.4);transition:transform .2s}" +
  ".cpp-btn:hover{transform:translateY(-2px);text-decoration:none}" +
  ".cpp-btn[disabled]{opacity:.7;cursor:default}" +
  ".cpp-fine{margin-top:14px;font-size:.72rem;color:rgba(255,255,255,.45)}" +
  ".cpp-error{margin-top:6px;color:#ffb4a8;font-size:.85rem;min-height:1em}" +
  ".cpp-success{display:none;flex-direction:column;align-items:center}" +
  ".cpp-success .cpp-check{width:66px;height:66px;border-radius:50%;background:rgba(63,157,109,.2);color:#5bbf8b;display:grid;place-items:center;font-size:2rem;margin-bottom:16px;font-weight:700}" +
  ".cpp-card.done .cpp-intro,.cpp-card.done .cpp-form,.cpp-card.done .cpp-fine{display:none}" +
  ".cpp-card.done .cpp-success{display:flex}" +
  ".cpp-continue{margin-top:16px;background:none;border:none;color:rgba(255,255,255,.6);font-size:.88rem;cursor:pointer;text-decoration:underline;font-family:inherit}" +
  ".cpp-continue:hover{color:#fff}" +
  "@media(max-width:680px){.cpp-card{padding:36px 26px 26px}.cpp-card h3{font-size:1.45rem}}";

  var HTML =
  '<div class="cpp-modal" id="cppModal" role="dialog" aria-modal="true" aria-hidden="true">' +
    '<div class="cpp-card" id="cppCard">' +
      '<img class="cpp-logo" src="/assets/clearpath-logo-white.png" alt="ClearPath Pediatrics" />' +
      '<div class="cpp-intro">' +
        '<span class="cpp-eyebrow">For families like yours</span>' +
        '<h3>Clarity for families, right in your inbox.</h3>' +
        '<p>Get RN-written tips on navigating complex pediatric care — and be first to grab a free 30-minute consultation. No spam, unsubscribe anytime.</p>' +
      '</div>' +
      '<form class="cpp-form" id="cppForm" novalidate>' +
        '<input type="email" id="cppEmail" placeholder="your@email.com" aria-label="Your email address" required />' +
        '<button type="submit" class="cpp-btn" id="cppSubmit">Get Started →</button>' +
        '<div class="cpp-error" id="cppError" role="alert"></div>' +
      '</form>' +
      '<p class="cpp-fine">By subscribing you agree to receive emails from ClearPath Pediatrics.</p>' +
      '<div class="cpp-success">' +
        '<div class="cpp-check">✓</div>' +
        "<h3>You're in! 🎉</h3>" +
        '<p>Check your inbox for a welcome note. Ready to talk with an RN?</p>' +
        '<a href="https://calendly.com/clearpathpediatrics/30min" target="_blank" rel="noopener" class="cpp-btn">Book My Free Call →</a>' +
        '<button type="button" class="cpp-continue" id="cppContinue">Continue to site →</button>' +
      '</div>' +
    '</div>' +
  '</div>';

  function init() {
    var style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    var holder = document.createElement("div");
    holder.innerHTML = HTML;
    document.body.appendChild(holder.firstChild);

    var modal = document.getElementById("cppModal");
    var card = document.getElementById("cppCard");
    var form = document.getElementById("cppForm");
    var email = document.getElementById("cppEmail");
    var submit = document.getElementById("cppSubmit");
    var err = document.getElementById("cppError");

    function open() { modal.classList.add("open"); modal.setAttribute("aria-hidden", "false"); setTimeout(function () { email.focus(); }, 300); }
    function dismiss() { modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); }
    setTimeout(open, DELAY_MS);
    document.getElementById("cppContinue").addEventListener("click", dismiss);

    var isEmail = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = email.value.trim();
      err.textContent = "";
      if (!isEmail(val)) { err.textContent = "Please enter a valid email address."; return; }
      submit.disabled = true; submit.textContent = "Submitting…";
      fetch("https://a.klaviyo.com/client/subscriptions/?company_id=" + encodeURIComponent(KLAVIYO_PUBLIC_KEY), {
        method: "POST",
        headers: { "Content-Type": "application/json", "revision": "2024-10-15" },
        body: JSON.stringify({ data: { type: "subscription", attributes: { custom_source: SOURCE, profile: { data: { type: "profile", attributes: { email: val } } } }, relationships: { list: { data: { type: "list", id: KLAVIYO_LIST_ID } } } } })
      }).then(function (res) {
        if (res.ok || res.status === 202) {
          markSubscribed(val);
          card.classList.add("done");
          if (window.cpTrack) window.cpTrack("popup_lead", {});
        } else {
          err.textContent = "Something went wrong. Please try again.";
          submit.disabled = false; submit.innerHTML = "Get Started →";
        }
      }).catch(function () {
        err.textContent = "Network error. Please try again.";
        submit.disabled = false; submit.innerHTML = "Get Started →";
      });
    });
  }

  if (document.body) init();
  else document.addEventListener("DOMContentLoaded", init);
})();
