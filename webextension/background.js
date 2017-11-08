const amo = /^https?:\/\/(discovery\.)?(addons\.mozilla\.org|testpilot\.firefox\.com)|^about:/i;
// let defaultPreference = {
//   trimSpace: true,
//   removeEmptyLine: true,
//   version: 1
// };
let preferences = {};
let _clipboardText = '';

const storageChangeHandler = (changes, area) => {
  if(area === 'local') {
    let changedItems = Object.keys(changes);
    for (let item of changedItems) {
      preferences[item] = changes[item].newValue;
    }
  }
};

const loadPreference = () => {
  browser.storage.local.get().then(results => {
    if ((typeof results.length === 'number') && (results.length > 0)) {
      results = results[0];
    }
    if (!results.version) {
      //sync preferences from legacy-addon-data
      let port = browser.runtime.connect({name:'sync-legacy-addon-data'});
      port.onMessage.addListener( msg => {
        preferences = msg;
        preferences.version = 1;
        browser.storage.local.set(preferences).then(res => {
          browser.storage.onChanged.addListener(storageChangeHandler);
        }, err => {
        });
      });
      // preferences = defaultPreference;
      // browser.storage.local.set(defaultPreference).then(res => {
      //   browser.storage.onChanged.addListener(storageChangeHandler);
      // }, err => {
      // });
    } else {
      preferences = results;
      browser.storage.onChanged.addListener(storageChangeHandler);
    }
  });
};

const getClipData = callback => {
  let textArea = document.getElementById('clipboard');
  let onPaste = event => {
    const transfer = event.clipboardData;
    let pastedData = transfer.getData('Text');
    callback(pastedData);
    //document.removeEventListener("paste", onPaste, false);
  }
  let onInput = event => {
    event.target.textContent = '';
    //event.target.removeEventListener("input", onInput, false);
  };
  let body = document.querySelector('body');
  if(!textArea) {
    textArea = document.createElement('textarea');
    textArea.setAttribute('id', 'clipboard');
    textArea.setAttribute('type', 'text');
    textArea.setAttribute('value', '');
    textArea.setAttribute('contenteditable', 'true');
    body.appendChild(textArea);
  }
  else {
    textArea.textContent = '';
  }
  textArea.addEventListener('input', onInput, {capture: true, once: true});
  textArea.focus();
  document.addEventListener('paste', onPaste, {capture: true, once: true});
  document.execCommand('paste');
};

const getPlainText = callback => {
  getClipData( text => {
    if(text) {
      if(preferences.trimSpace) {
        text = text.replace(/^[ \t\f]+|[ \t\f]+$/gm, "");
      }
      if(preferences.removeEmptyLine) {
        text = text.replace(/[\n\r]+/g, '\n');
        text = text.replace(/\n$/,'');
      }
      callback(text);
    }
    else {
      callback('');
    }
  });
};

browser.browserAction.onClicked.addListener(tab => {
  getPlainText( text => {
    //let copyByWindow = tab.url.startsWith('https://addons.mozilla.org/');
    let copyByWindow = amo.test(tab.url) && tab.url !== 'about:blank';
    _clipboardText = text;
    if(copyByWindow) {
      browser.windows.create({
        url: 'copy.html',
        type: 'panel',
        top: 0,
        left: 0,
        width: 200,
        height: 70,
      }).then(windowInfo => {
        callback(true);
      });
    }
    else {
      let code = `(() => {
        document.addEventListener('copy', e => {
          e.stopImmediatePropagation(); // prevent conflict
          e.preventDefault(); // prevent copy of other data
          e.clipboardData.setData('text/plain', ${JSON.stringify(text)});
        }, {capture: true, once: true}); // FF50+, Ch55+
        return document.execCommand('copy');
      })();`;

      browser.tabs.executeScript(tab.id, {code, allFrames: false, matchAboutBlank: true});
    }
  });
});

window.addEventListener('DOMContentLoaded', event => {
  loadPreference();
});

function getClipboardText(cb) {
  return _clipboardText;
}
