/*
Default settings. Initialize storage to these values.
*/
let nluCredentials = {
	url: "url",
	password: "passwd"
}

/*
On startup, check whether we have stored settings.
If we don't, then store the default settings.
*/
function checkStoredSettings(storedSettings) {
	if (!storedSettings.nluCredentials) {
		browser.storage.local.set({nluCredentials});
	}
}

const gettingStoredSettings = browser.storage.local.get();
gettingStoredSettings.then(checkStoredSettings, onError);

browser.contextMenus.create({
	id: "nlu-analyze-text",
	title: "Analyze selection's Sentiment",
	contexts: ["selection"],
},
	() => void browser.runtime.lastError,
);

browser.contextMenus.create({
	id: "nlu-open-options",
	title: "Options",
	contexts: ["all"],
},
	() => void browser.runtime.lastError,
);


browser.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === "nlu-analyze-text") { 
		sendNluRequest(info, tab);
	} else if (info.menuItemId === "nlu-open-options") { 
		open_options();
	}

});



function generateAuthHeader(apikey) { 
	const authheader = 'Basic '+ btoa(apikey);
	return authheader;
}

function onError(e) {
	console.error(e);
}

async function sendNluRequest(info, tab) {
	try {
		// Get url and apikey from storage
		let { nluCredentials } = await browser.storage.local.get("nluCredentials");
		const authHeader = generateAuthHeader('apikey:'+nluCredentials.password);
		// Get the selected text from the selection
		let text = info.selectionText || "";

		// Ensure we have the necessary data
		if (!nluCredentials.url || !authHeader || !text || nluCredentials.url === "url" || nluCredentials.password === "password" ) {
			browser.notifications.create({
				"type": "basic",
				"title": "Missing required data: url, apikey, or text",
				"message": `Have you configured the addon's options?`
			});
			return;
		}

		const requestOptions = {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'authorization': authHeader
			},
			body: JSON.stringify({
				"features" : {
					"emotion"  : { "document" : "true" },
					"sentiment" : {},
				},
				"text" : text


			}),
		};

		// Make the async fetch request
		let response = await fetch(nluCredentials.url, requestOptions);

		let nluResult;
		// Handle the response
		if (!response.ok) {
			browser.notifications.create({
				"type": "basic",
				"title": "Something did not work as expected",
				"message": `Is the text in one of the supported languages?`
			});
			console.dir(response);

			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		let data = await response.json();

		console.log("Response:", data);
		if (data.error) { 
			nluResult = {
				warning: data.error
			};
		} else if (data.warnings) { 
			nluResult = {
				warning: data.warnings[0]
			};
			if (data.sentiment.document.score) { 
				nluResult.sentiment=data.sentiment.document.score;
			}
		} else { 
			nluResult = {
				emotions: data.emotion.document.emotion,
				sentiment: data.sentiment.document.score
			};
		}

		// Store the result in storage
		await browser.storage.local.set({ nluResult });

		// Open the popup
		openPopup(tab);

	} catch (error) {
		console.error("Error:", error);
	}
}


function openPopup(tab) {
	browser.windows.create({
		url: "action/index.html",
		type: "popup",
		width: 650,
		height: 700
	});
}

function open_options() {
  browser.runtime.openOptionsPage();
}


