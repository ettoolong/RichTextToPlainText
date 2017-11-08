(() => {
  let t = browser.extension.getBackgroundPage().getClipboardText();
  document.addEventListener('copy', e => {
    e.stopImmediatePropagation(); // prevent conflict
    e.preventDefault(); // prevent copy of other data
    e.clipboardData.setData('text/plain', t);
  }, {capture: true, once: true}); // FF50+, Ch55+
  document.execCommand('copy');
  window.close();
})();
