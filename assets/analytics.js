/* =====================================================================
   ClearPath Pediatrics — analytics & retargeting (one file, whole site)
   ---------------------------------------------------------------------
   👉  PASTE YOUR IDs BELOW. Leave a value as its placeholder to keep it off.
   Nothing tracks until you add an ID — no errors, no data, totally safe.

   Where to get each ID:
   • GA4_MEASUREMENT_ID  → analytics.google.com → Admin → Data Streams → your web
                            stream → "Measurement ID" (looks like G-XXXXXXXXXX)
   • META_PIXEL_ID       → business.facebook.com → Events Manager → your Pixel →
                            the numeric Pixel ID
   • GOOGLE_ADS_ID +     → ads.google.com → Tools → Conversions (only if you run
     GOOGLE_ADS_LABEL      Google Ads and want to count booked calls as conversions)
   ===================================================================== */
(function () {
  var GA4_MEASUREMENT_ID = "G-SNP301JHR0";      // ClearPath Pediatrics web stream
  var META_PIXEL_ID      = "XXXXXXXXXXXXXXX";     // <-- paste Meta Pixel ID
  var GOOGLE_ADS_ID      = "AW-XXXXXXXXX";        // <-- optional (Google Ads)
  var GOOGLE_ADS_LABEL   = "";                     // <-- optional conversion label

  // A placeholder is a run of X's. (The old test, "contains no X", would have
  // silently switched off any real ID that happened to contain the letter.)
  var set = function (v) { return !!v && !/X{6,}/.test(v); };
  var hasGA4  = set(GA4_MEASUREMENT_ID);
  // The Meta Pixel never loads on article, tool, funnel or booking pages, even
  // once an ID is added. Those pages are about children's health and care, and
  // the FTC has acted against health services for passing that context to ad
  // platforms (GoodRx, BetterHelp). Homepage and service pages only.
  var HEALTH_CONTEXT = /^\/(blog|tools|free-care-roadmap|roadmap-on-its-way|book|kit-access|private|food-allergy-starter-kit)(\/|$)/.test(location.pathname);
  var hasMeta = set(META_PIXEL_ID) && !HEALTH_CONTEXT;
  var hasAds  = set(GOOGLE_ADS_ID);

  // ---- Google Analytics 4 (+ Google Ads, same gtag) ----
  if (hasGA4 || hasAds) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    // Measurement only: no Google Signals and no ad personalization from a site
    // whose pages describe children's medical situations.
    if (hasGA4) window.gtag("config", GA4_MEASUREMENT_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
    if (hasAds) window.gtag("config", GOOGLE_ADS_ID);
    var g = document.createElement("script");
    g.async = true;
    g.src = "https://www.googletagmanager.com/gtag/js?id=" + (hasGA4 ? GA4_MEASUREMENT_ID : GOOGLE_ADS_ID);
    document.head.appendChild(g);
  }

  // ---- Meta (Facebook/Instagram) Pixel — for retargeting ads ----
  if (hasMeta) {
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", META_PIXEL_ID);
    window.fbq("track", "PageView");
  }

  // ---- Unified tracking helper (used by the site + quiz) ----
  window.cpTrack = function (name, params) {
    params = params || {};
    try { if (window.gtag && hasGA4) window.gtag("event", name, params); } catch (e) {}
    try { if (window.fbq && hasMeta) window.fbq("trackCustom", name, params); } catch (e) {}
  };

  // ---- Funnel events --------------------------------------------------------
  // Only the step and where it happened are recorded: never names, emails or
  // anything a family typed. Mark these as Key events in GA4 to count them:
  //   roadmap_cta_click   clicked through to the Free Care Roadmap (placement)
  //   roadmap_submit      sent the Roadmap form (fired by the funnel page)
  //   book_cta_click      clicked a "book a call" button (placement)
  //   booking_scheduled   completed a booking in the Calendly calendar
  //   tips_signup / capture_shown / capture_dismissed   from capture.js
  var pageType = (function (p) {
    if (p === "/") return "home";
    if (/^\/blog\/topics\//.test(p)) return "hub";
    if (/^\/blog\/.+/.test(p)) return "article";
    if (/^\/tools\//.test(p)) return "tool";
    return p.replace(/^\/|\/$/g, "").split("/")[0] || "other";
  })(location.pathname);

  document.addEventListener("click", function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    var placement = a.getAttribute("data-cta") || "link";
    if (href.indexOf("/free-care-roadmap") === 0) {
      window.cpTrack("roadmap_cta_click", { placement: placement, page_type: pageType, transport_type: "beacon" });
    } else if (href.indexOf("/book") === 0 || href.indexOf("calendly.com") !== -1) {
      window.cpTrack("book_cta_click", { placement: placement, page_type: pageType, transport_type: "beacon" });
    }
  }, true);

  // Calendly reports a completed booking to the page it is embedded in. This is
  // the real conversion; a click on a "book" button is only intent.
  window.addEventListener("message", function (e) {
    if (e.origin !== "https://calendly.com" || !e.data || e.data.event !== "calendly.event_scheduled") return;
    window.cpTrack("booking_scheduled", { page_type: pageType });
    try { if (window.gtag && hasAds && GOOGLE_ADS_LABEL) window.gtag("event", "conversion", { send_to: GOOGLE_ADS_ID + "/" + GOOGLE_ADS_LABEL }); } catch (err) {}
    try { if (window.fbq && hasMeta) window.fbq("track", "Schedule"); } catch (err) {}
  });
})();
