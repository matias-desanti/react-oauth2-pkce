"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMessageForExpiredRefreshToken = exports.epochTimeIsPast = exports.epochAtSecondsFromNow = exports.decodeJWT = exports.fetchWithRefreshToken = exports.fetchTokens = exports.redirectToLogin = exports.EXPIRED_REFRESH_TOKEN_ERROR_CODES = void 0;
const pkceUtils_1 = require("./pkceUtils");
const codeVerifierStorageKey = 'PKCE_code_verifier';
// [ AzureAD,]
exports.EXPIRED_REFRESH_TOKEN_ERROR_CODES = ['AADSTS700084'];
async function redirectToLogin(config) {
    // Create and store a random string in localStorage, used as the 'code_verifier'
    const codeVerifier = (0, pkceUtils_1.generateRandomString)(96);
    localStorage.setItem(codeVerifierStorageKey, codeVerifier);
    // Hash and Base64URL encode the code_verifier, used as the 'code_challenge'
    (0, pkceUtils_1.generateCodeChallenge)(codeVerifier).then((codeChallenge) => {
        // Set query parameters and redirect user to OAuth2 authentication endpoint
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: config.clientId,
            scope: config.scope,
            redirect_uri: config.redirectUri,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
            ...config.extraAuthParams,
        });
        // Call any preLogin function in authConfig
        if (config?.preLogin)
            config.preLogin();
        window.location.replace(`${config.authorizationEndpoint}?${params.toString()}`);
    });
}
exports.redirectToLogin = redirectToLogin;
// This is called a "type predicate". Which allow us to know which kind of response we got, in a type safe way.
function isTokenResponse(body) {
    return body.access_token !== undefined;
}
function buildUrlEncodedRequest(tokenRequest) {
    let queryString = '';
    for (const [key, value] of Object.entries(tokenRequest)) {
        queryString += (queryString ? '&' : '') + key + '=' + encodeURIComponent(value);
    }
    return queryString;
}
function postWithXForm(tokenEndpoint, tokenRequest) {
    return fetch(tokenEndpoint, {
        method: 'POST',
        body: buildUrlEncodedRequest(tokenRequest),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then((response) => {
        if (!response.ok) {
            console.error(response);
            throw Error(response.statusText);
        }
        return response.json().then((body) => {
            if (isTokenResponse(body)) {
                return body;
            }
            else {
                console.error(body);
                throw Error(body.error_description);
            }
        });
    });
}
const fetchTokens = (config) => {
    /*
      The browser has been redirected from the authentication endpoint with
      a 'code' url parameter.
      This code will now be exchanged for Access- and Refresh Tokens.
    */
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    const codeVerifier = window.localStorage.getItem(codeVerifierStorageKey);
    if (!authCode) {
        throw Error("Parameter 'code' not found in URL. \nHas authentication taken place?");
    }
    if (!codeVerifier) {
        throw Error("Can't get tokens without the CodeVerifier. \nHas authentication taken place?");
    }
    const tokenRequest = {
        grant_type: 'authorization_code',
        code: authCode,
        scope: config.scope,
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        code_verifier: codeVerifier,
        ...config.extraAuthParams,
    };
    return postWithXForm(config.tokenEndpoint, tokenRequest);
};
exports.fetchTokens = fetchTokens;
const fetchWithRefreshToken = (props) => {
    const { config, refreshToken } = props;
    const tokenRequest = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        scope: config.scope,
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
    };
    return postWithXForm(config.tokenEndpoint, tokenRequest);
};
exports.fetchWithRefreshToken = fetchWithRefreshToken;
/**
 * Decodes the base64 encoded JWT. Returns a TToken.
 */
const decodeJWT = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64)
            .split('')
            .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
            .join(''));
        return JSON.parse(jsonPayload);
    }
    catch (e) {
        console.error(e);
        throw Error('Failed to decode the access token.\n\tIs it a proper Java Web Token?\n\t' +
            "You can disable JWT decoding by setting the 'decodeToken' value to 'false' the configuration.");
    }
};
exports.decodeJWT = decodeJWT;
// Returns epoch time (in seconds) for when the token will expire
const epochAtSecondsFromNow = (secondsFromNow) => Math.round(Date.now() / 1000 + secondsFromNow);
exports.epochAtSecondsFromNow = epochAtSecondsFromNow;
/**
 * Check if the Access Token has expired.
 * Will return True if the token has expired, OR there is less than 5min until it expires.
 */
function epochTimeIsPast(timestamp) {
    const now = Math.round(Date.now()) / 1000;
    const nowWithBuffer = now + 120;
    return nowWithBuffer >= timestamp;
}
exports.epochTimeIsPast = epochTimeIsPast;
const errorMessageForExpiredRefreshToken = (errorMessage) => {
    let expired = false;
    exports.EXPIRED_REFRESH_TOKEN_ERROR_CODES.forEach((errorCode) => {
        if (errorMessage.includes(errorCode)) {
            expired = true;
        }
    });
    return expired;
};
exports.errorMessageForExpiredRefreshToken = errorMessageForExpiredRefreshToken;
