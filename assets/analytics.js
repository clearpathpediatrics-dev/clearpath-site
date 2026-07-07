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
  var GA4_MEASUREMENT_ID = "G-XXXXXXXXXX";      // <-- paste GA4 ID
  var META_PIXEL_ID      = "XXXXXXXXXXXXXXX";     // <-- paste Meta Pixel ID
  var GOOGLE_ADS_ID      = "AW-XXXXXXXXX";        // <-- optional (Google Ads)
  var GOOGLE_ADS_LABEL   = "";                     // <-- optional conversion label

  var set = function (v) { return v && v.indexOf("X") === -1; };
  var hasGA4  = set(GA4_MEASUREMENT_ID);
  var hasMeta = set(META_PIXEL_ID);
  var hasAds  = set(GOOGLE_ADS_ID);

  // ---- Google Analytics 4 (+ Google Ads, same gtag) ----
  if (hasGA4 || hasAds) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    if (hasGA4) window.gtag("config", GA4_MEASUREMENT_ID);
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

  // ---- Auto conversion tracking: any "Book a call" (Calendly) click ----
  document.addEventListener("click", function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a[href*="calendly.com"]') : null;
    if (!a) return;
    try { if (window.gtag && hasGA4) window.gtag("event", "book_call_click", { transport_type: "beacon" }); } catch (e) {}
    try { if (window.gtag && hasAds && GOOGLE_ADS_LABEL) window.gtag("event", "conversion", { send_to: GOOGLE_ADS_ID + "/" + GOOGLE_ADS_LABEL }); } catch (e) {}
    try { if (window.fbq && hasMeta) window.fbq("track", "Schedule"); } catch (e) {}
  }, true);
})();
