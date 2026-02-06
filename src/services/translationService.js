
/**
 * Service to handle text translation using the LibreTranslate API.
 */
/**
 * Service to handle text translation using the LibreTranslate API with multi-mirror fallback.
 */
const MIRRORS = [
    "https://translate.argosopentech.com/translate",
    "https://translate.terraprint.co/translate",
    "https://lt.vern.cc/translate",
    "https://libretranslate.de/translate"
];

export const translateText = async (text, targetLang = "es", sourceLang = "en") => {
    if (!text) return null;

    for (const mirror of MIRRORS) {
        try {
            console.log(`Attempting translation with mirror: ${mirror}`);
            const response = await fetch(mirror, {
                method: "POST",
                body: JSON.stringify({
                    q: text,
                    source: sourceLang,
                    target: targetLang,
                    format: "text"
                }),
                headers: { "Content-Type": "application/json" },
                signal: AbortSignal.timeout(5000) // 5 second timeout per mirror
            });

            if (response.ok) {
                const data = await response.json();
                if (data.translatedText) {
                    return data.translatedText;
                }
            }
        } catch (error) {
            console.warn(`Mirror ${mirror} failed:`, error.message);
            // Continue to next mirror
        }
    }

    console.error("All translation mirrors failed.");
    return null;
};
