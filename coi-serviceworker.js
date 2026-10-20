/*! coi-serviceworker v0.1.7 - Guido Zuidhof, MIT License */
let coi = {
    shouldRegister: () => true,
    shouldDeregister: () => false,
    coepCredentialless: () => true,
    crossOriginEmbedderPolicy: () => "require-corp",
    crossOriginOpenerPolicy: () => "same-origin",
};

(() => {
    if (typeof window === 'undefined') {
        self.addEventListener("install", () => self.skipWaiting());
        self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

        self.addEventListener("fetch", function (event) {
            if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") {
                return;
            }

            event.respondWith(
                fetch(event.request)
                    .then((response) => {
                        if (response.status === 0) {
                            return response;
                        }

                        const newHeaders = new Headers(response.headers);
                        newHeaders.set("Cross-Origin-Embedder-Policy", coi.coepCredentialless() ? "credentialless" : coi.crossOriginEmbedderPolicy());
                        newHeaders.set("Cross-Origin-Opener-Policy", coi.crossOriginOpenerPolicy());

                        return new Response(response.body, {
                            status: response.status,
                            statusText: response.statusText,
                            headers: newHeaders,
                        });
                    })
                    .catch((e) => console.error(e))
            );
        });
    } else {
        // Registration logic
        const coi = window.coi || {};
        if (coi.shouldDeregister && coi.shouldDeregister()) {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                for (let registration of registrations) {
                    registration.unregister();
                }
            });
        } else if (coi.shouldRegister ? coi.shouldRegister() : true) {
            // Service worker registration
            window.addEventListener("load", function () {
                navigator.serviceWorker.register(window.document.currentScript ? window.document.currentScript.src : "coi-serviceworker.js").catch((err) => {
                    console.error("Coep-ServiceWorker failed to register: ", err);
                });
            });
        }
    }
})();
