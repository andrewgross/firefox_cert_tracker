browser.webRequest.onHeadersReceived.addListener(
    checkAndSaveCertificate,
    { urls: ["<all_urls>"], types: ['main_frame'] },
    ["blocking"]
);

async function checkAndSaveCertificate(details) {
    console.log(`Doing async stuff`);
    const host = new URL(details.url).host;
    let securityInfo = await browser.webRequest.getSecurityInfo(details.requestId, { certificateChain: true });
    console.log(`Checking cert chain for ${host}`);
    if (securityInfo.state === "secure" || securityInfo.state === "weak") {
        cert = certContainer(securityInfo.certificates);
        // Check if certificate information for the URL is already stored
        console.log('All Stored Certs:', await browser.storage.local.get())
        await browser.storage.local.get(host)
            .then((storedCerts) => {
                console.log('Stored Certs:', storedCerts)
                console.log('What is Stored Certs:', Object.getOwnPropertyNames(storedCerts))
                let host_certs = storedCerts[host];
                console.log('Host Certs:', host_certs)
                console.log('What is Host Certs:', Object.getOwnPropertyNames(host_certs))
                console.log('Cert Fingerprint', cert.fingerprint)
                // And if it is, check if the certificate chain has changed
                if (cert.fingerprint in host_certs) {
                    console.log(`Host and fingerprint found for ${host}: ${cert.fingerprint}`)
                    host_certs[cert.fingerprint] = updateCertContainer(host_certs[cert.fingerprint]);
                    console.log('Updated Cert:', host_certs)
                    browser.storage.local.set({ [host]: host_certs })
                    console.log(`Certificate chain for ${host} unchanged. Timestamp updated.`);
                    // Alert if the certificate chain has changed (and save the new chain)
                } else {
                    console.log(`Host found but not fingerprint for ${host}: ${cert.fingerprint}`)
                    host_certs[cert.fingerprint] = cert;
                    console.log('Extended Stored Certs:', host_certs)
                    browser.storage.local.set({ [host]: host_certs })
                    alert(`Certificate chain for ${host} has changed.`);
                }
            },
                // If no certificate information is stored for the URL, save it
                await browser.storage.local.set({ [host]: createCertContainer(cert) })
                    .then(() => console.log(`Saved certificate chain for ${host}`))
                    .catch(e => console.error(`Error saving certificate chain for ${host}: ${e}`, e))
            )
    } else {
        console.log(`Connection to ${host} is not secure.`);
    }
}

function updateCertContainer(certContainer) {
    certContainer["last_seen"] = new Date();
    return certContainer
}

function certContainer(certificates) {
    const chain_fingerprint = certificates.map(cert => cert.fingerprint.sha256).join('|');
    let certInfo = [];
    for (let cert of certificates) {
        certInfo.push({
            "issuer": cert.issuer,
            "subject": cert.subject,
            "fingerprint": cert.fingerprint.sha256,
            "isBuiltInRoot": cert.isBuiltInRoot,
            "serialNumber": cert.serialNumber,
            "validity": {
                "start": cert.validity.start,
                "end": cert.validity.end,
            },
        });
    }
    return {
        "fingerprint": chain_fingerprint,
        "cert_info": certInfo,
        "last_seen": new Date(),
    }
}

function createCertContainer(cert) {
    const fingerprint_dictionary = {};
    fingerprint_dictionary[cert.fingerprint] = cert;
    console.log('Created dictionary:', fingerprint_dictionary);
    return fingerprint_dictionary
}