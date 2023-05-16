function logCertificateChain(details) {
    const { requestId, url, responseHeaders } = details;
    console.log(`Checking certificate chain for ${url}:`)
    if (responseHeaders) {
        responseHeaders.map(header => console.log(`${header.name}: ${header.value}`));
        const certificateChain = responseHeaders.filter(
            header => header.name.toLowerCase() === "x-serviceworker-proxy-ca"
        );

        if (certificateChain.length > 0) {
            console.log(`Certificate chain for ${url}:`);
            console.log(certificateChain[0].value);
        }
    }

    return {};
}

browser.webRequest.onHeadersReceived.addListener(
    logCertificateChain,
    { urls: ["<all_urls>"] },
    ["responseHeaders"]
);
