browser.webRequest.onHeadersReceived.addListener(
    checkAndSaveCertificate,
    { urls: ["<all_urls>"], types: ['main_frame'] },
    ["blocking"]
);

async function checkAndSaveCertificate(details) {
    let securityInfo = await browser.webRequest.getSecurityInfo(details.requestId, { certificateChain: true });
    if (securityInfo.state === "secure" || securityInfo.state === "weak") {
        let certInfo = [];
        for (let cert of securityInfo.certificates) {
            certInfo.push(cert.subject);
        }

        // Check if certificate information for the URL is already stored
        browser.storage.local.get(details.url)
            .then((storedCerts) => {
                if (storedCerts[details.url] && !isEqual(certInfo, storedCerts[details.url])) {
                    console.log(`Certificate chain for ${details.url} has changed.`);
                    alert(`Certificate chain for ${details.url} has changed.`);
                }
                // Save to local storage
                browser.storage.local.set({ [details.url]: certInfo })
                    .then(() => console.log(`Saved certificate chain for ${details.url}`))
                    .catch(e => console.error(`Error saving certificate chain for ${details.url}: ${e}`));
            });
    } else {
        console.log(`Connection to ${details.url} is not secure.`);
    }
}

// Function to compare two arrays
function isEqual(arr1, arr2) {
    return JSON.stringify(arr1.sort()) === JSON.stringify(arr2.sort());
}