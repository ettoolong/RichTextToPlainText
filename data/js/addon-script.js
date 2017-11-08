const webExtension = require('sdk/webextension');
webExtension.startup().then(({browser}) => {
  browser.runtime.onConnect.addListener(port => {
    if (port.name === 'sync-legacy-addon-data') {
      let pref = require('sdk/preferences/service');
      let addonPrefs = {};
      let prefRoot = 'extensions.@richtexttoplaintext.';
      let prefsList = ['trimSpace', 'removeEmptyLine'];
      for(let i=0;i<prefsList.length;++i){
        addonPrefs[prefsList[i]] = pref.get(prefRoot + prefsList[i]);
        if(addonPrefs[prefsList[i]] === undefined)
          addonPrefs[prefsList[i]] = true;
      }
      port.postMessage(addonPrefs);
    }
  });
});
