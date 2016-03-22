let self = require("sdk/self");
let data = self.data;
let clipboard = require("sdk/clipboard");
let _ = require("sdk/l10n").get;

let pref = require('sdk/preferences/service');
let addonPrefs = {};
var prefRoot = 'extensions.@richtexttoplaintext.';
let prefsList = ['trimSpace', 'removeEmptyLine'];
for(let i=0;i<prefsList.length;++i){
  addonPrefs[prefsList[i]] = pref.get(prefRoot + prefsList[i]);
}

require("sdk/simple-prefs").on("", function(prefName){
  addonPrefs[prefName] = pref.get(prefRoot + prefName);
});

require("sdk/ui/button/action").ActionButton({
  id: "richtexttoplaintext-toolbutton",
  label: _("buttonLabel"),
  icon: {
    "16": data.url("img/icon.svg"),
    "32": data.url("img/icon.svg"),
    "64": data.url("img/icon.svg")
  },
  onClick: function handleClick(state) {
    let text = clipboard.get("text");
    if(text) {
      if(addonPrefs.trimSpace) {
        text = text.replace(/\n\r/g, "\n");
        let lines = text.split("\n");
        text = '';
        for (let i=0; i < lines.length; i++) {
          text+=lines[i].replace(/^\s+|\s+$/g, "");
          if(i < lines.length-1) {
            text+="\n";
          }
        }
        //text = text.replace(/^\s+|\s+$/gm, "");
      }
      if(addonPrefs.removeEmptyLine) {
        text = text.replace(/[\n\r]+/g, "\n");
        text = text.replace(/\n$/,'');
      }
      clipboard.set(text, "text");
    }
  }
});
