/* SwiftDrop — js/app.js
   Loader that injects shared scripts (utils, auth, page modules) using a base path
   so the same `app.js` works from pages in subfolders.
*/
(function () {
  const files = [
    "util.js",
    "Auth.js",
    "Customer.js",
    "Driver.js",
    "landing.js",
  ];

  // Determine base URL (directory) of this script so relative paths work from subfolders
  const current = document.currentScript && document.currentScript.src;
  let base = "";
  if (current) {
    base = current.replace(/app\.js(\?.*)?$/, "");
  } else {
    // Fallback to relative path root
    base = (function () {
      const p = location.pathname.split('/');
      p.pop();
      return p.join('/') + '/js/';
    })();
  }

  // Inject scripts in order with defer so they execute after parsing
  files.forEach((file) => {
    const s = document.createElement("script");
    s.src = base + file;
    s.defer = true;
    document.head.appendChild(s);
  });
})();
