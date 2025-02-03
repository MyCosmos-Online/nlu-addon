const nluURL = document.querySelector("#url");
const nluAPIKEY = document.querySelector("#password");

/*
Store the currently selected settings using chrome.storage.local.
*/
function storeSettings() {
  chrome.storage.local.set({
    nluCredentials: {
      url: nluURL.value,
      password: nluAPIKEY.value
    }
  });
}

/*
Update the options UI with the settings values retrieved from storage,
or the default settings if the stored settings are empty.
*/
function updateUI(restoredSettings) {
  nluURL.value = restoredSettings.nluCredentials.url || "";
  nluAPIKEY.value = restoredSettings.nluCredentials.password || "";
}

function onError(e) {
  console.error(e);
}

/*
On opening the options page, fetch stored settings and update the UI with them.
*/
const gettingStoredSettings = chrome.storage.local.get();
gettingStoredSettings.then(updateUI, onError);

/*
On blur, save the currently selected settings.
*/
nluURL.addEventListener("blur", storeSettings);
nluAPIKEY.addEventListener("blur", storeSettings);
