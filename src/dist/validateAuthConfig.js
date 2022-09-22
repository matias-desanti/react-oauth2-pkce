"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAuthConfig = void 0;
function stringIsUnset(value) {
    const unset = ['', undefined, null];
    return unset.includes(value);
}
function validateAuthConfig(config) {
    if (stringIsUnset(config?.clientId))
        throw Error("'clientId' must be set in the 'AuthConfig' object passed to 'react-oauth2-code-pkce' AuthProvider");
    if (stringIsUnset(config?.authorizationEndpoint))
        throw Error("'authorizationEndpoint' must be set in the 'AuthConfig' object passed to 'react-oauth2-code-pkce' AuthProvider");
    if (stringIsUnset(config?.tokenEndpoint))
        throw Error("'tokenEndpoint' must be set in the 'AuthConfig' object passed to 'react-oauth2-code-pkce' AuthProvider");
    if (stringIsUnset(config?.redirectUri))
        throw Error("'redirectUri' must be set in the 'AuthConfig' object passed to 'react-oauth2-code-pkce' AuthProvider");
}
exports.validateAuthConfig = validateAuthConfig;
