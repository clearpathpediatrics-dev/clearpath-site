/* Retired. Replaced by /assets/capture.js, which captures email without
   blocking the page. Kept as a loader so any page still referencing this file
   (a cached copy, or one missed in the migration) gets the new behaviour rather
   than nothing, and never the old two-second email wall. */
(function () {
  if (window.__cppCapture) return;
  var s = document.createElement("script");
  s.src = "/assets/capture.js?v=20261020b";
  s.defer = true;
  document.head.appendChild(s);
})();
