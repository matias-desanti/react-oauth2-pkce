"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCodeChallenge = exports.generateRandomString = exports.getRandomInteger = void 0;
function getRandomInteger(range) {
    const max_range = 256; // Highest possible number in Uint8
    // Create byte array and fill with 1 random number
    const byteArray = new Uint8Array(1);
    window.crypto.getRandomValues(byteArray); // This is the new, and safer API than Math.Random()
    // If the generated number is out of range, try again
    if (byteArray[0] >= Math.floor(max_range / range) * range)
        return getRandomInteger(range);
    return byteArray[0] % range;
}
exports.getRandomInteger = getRandomInteger;
function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(getRandomInteger(possible.length - 1));
    }
    return text;
}
exports.generateRandomString = generateRandomString;
/**
 *  PKCE Code Challenge = base64url(hash(codeVerifier))
 */
async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(codeVerifier); // Encode the verifier to a byteArray
    const hash = await window.crypto.subtle.digest('SHA-256', bytes); // sha256 hash it
    const hashString = String.fromCharCode(...new Uint8Array(hash));
    const base64 = btoa(hashString); // Base64 encode the verifier hash
    return base64 // Base64Url encode the base64 encoded string, making it safe as a query param
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}
exports.generateCodeChallenge = generateCodeChallenge;
