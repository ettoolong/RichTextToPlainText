let self = require("sdk/self");
let data = self.data;
let clipboard = require("sdk/clipboard");
let _ = require("sdk/l10n").get;

require("sdk/ui/button/action").ActionButton({
  id: "googl-toolbutton",
  label: _("buttonLabel"),
  icon: {
    "16": data.url("img/icon.svg"),
    "32": data.url("img/icon.svg"),
    "64": data.url("img/icon.svg")
  },
  onClick: function handleClick(state) {
    var text = clipboard.get("text");
    if(text) {
      clipboard.set(text, "text");
    }
  }
});
