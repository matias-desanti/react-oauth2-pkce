"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProvider = exports.AuthContext = void 0;
const react_1 = __importStar(require("react")); // eslint-disable-line
const authentication_1 = require("./authentication");
const Hooks_1 = __importDefault(require("./Hooks"));
const validateAuthConfig_1 = require("./validateAuthConfig");
const FALLBACK_EXPIRE_TIME = 600; // 10minutes
exports.AuthContext = (0, react_1.createContext)({
    token: '',
    login: () => null,
    logOut: () => null,
    error: null,
    loginInProgress: false,
});
const AuthProvider = ({ authConfig, children }) => {
    const [refreshToken, setRefreshToken] = (0, Hooks_1.default)('ROCP_refreshToken', undefined);
    const [refreshTokenExpire, setRefreshTokenExpire] = (0, Hooks_1.default)('ROCP_refreshTokenExpire', (0, authentication_1.epochAtSecondsFromNow)(2 * FALLBACK_EXPIRE_TIME));
    const [token, setToken] = (0, Hooks_1.default)('ROCP_token', '');
    const [tokenExpire, setTokenExpire] = (0, Hooks_1.default)('ROCP_tokenExpire', (0, authentication_1.epochAtSecondsFromNow)(FALLBACK_EXPIRE_TIME));
    const [idToken, setIdToken] = (0, Hooks_1.default)('ROCP_idToken', undefined);
    const [loginInProgress, setLoginInProgress] = (0, Hooks_1.default)('ROCP_loginInProgress', false);
    const [tokenData, setTokenData] = (0, react_1.useState)();
    const [error, setError] = (0, react_1.useState)(null);
    let interval;
    // Set default values for internal config object
    const { autoLogin = true, decodeToken = true, scope = '', preLogin = () => null, postLogin = () => null, } = authConfig;
    const config = {
        ...authConfig,
        autoLogin: autoLogin,
        decodeToken: decodeToken,
        scope: scope,
        preLogin: preLogin,
        postLogin: postLogin,
    };
    (0, validateAuthConfig_1.validateAuthConfig)(config);
    function logOut() {
        setRefreshToken(undefined);
        setToken('');
        setTokenExpire((0, authentication_1.epochAtSecondsFromNow)(FALLBACK_EXPIRE_TIME));
        setRefreshTokenExpire((0, authentication_1.epochAtSecondsFromNow)(FALLBACK_EXPIRE_TIME));
        setIdToken(undefined);
        setTokenData(undefined);
        setLoginInProgress(false);
    }
    function login() {
        setLoginInProgress(true);
        (0, authentication_1.redirectToLogin)(config);
    }
    function handleTokenResponse(response) {
        setToken(response.access_token);
        setRefreshToken(response.refresh_token);
        setTokenExpire((0, authentication_1.epochAtSecondsFromNow)(response.expires_in || FALLBACK_EXPIRE_TIME));
        // If there is no refresh_token_expire, use access_token_expire + 10min.
        // If no access_token_expire, assume double the fallback expire time
        let refreshTokenExpire = response.refresh_token_expires_in || 2 * FALLBACK_EXPIRE_TIME;
        if (!response.refresh_token_expires_in && response.expires_in) {
            refreshTokenExpire = response.expires_in + FALLBACK_EXPIRE_TIME;
        }
        setRefreshTokenExpire((0, authentication_1.epochAtSecondsFromNow)(refreshTokenExpire));
        setIdToken(response.id_token);
        setLoginInProgress(false);
        try {
            if (config.decodeToken)
                setTokenData((0, authentication_1.decodeJWT)(response.access_token));
        }
        catch (e) {
            setError(e.message);
        }
    }
    function refreshAccessToken() {
        if (token && (0, authentication_1.epochTimeIsPast)(tokenExpire)) {
            if (refreshToken && !(0, authentication_1.epochTimeIsPast)(refreshTokenExpire)) {
                (0, authentication_1.fetchWithRefreshToken)({ config, refreshToken })
                    .then((result) => handleTokenResponse(result))
                    .catch((error) => {
                    setError(error);
                    if ((0, authentication_1.errorMessageForExpiredRefreshToken)(error)) {
                        logOut();
                        (0, authentication_1.redirectToLogin)(config);
                    }
                });
            }
            else {
                // The refresh token has expired. Need to log in from scratch.
                login();
            }
        }
    }
    // Register the 'check for soon expiring access token' interval (Every minute)
    (0, react_1.useEffect)(() => {
        interval = setInterval(() => refreshAccessToken(), 60000); // eslint-disable-line
        return () => clearInterval(interval);
    }, [token]); // This token dependency removes the old, and registers a new Interval when a new token is fetched.
    // Runs once on page load
    (0, react_1.useEffect)(() => {
        if (loginInProgress) {
            // The client has been redirected back from the Auth endpoint with an auth code
            const urlParams = new URLSearchParams(window.location.search);
            if (!urlParams.get('code')) {
                // This should not happen. There should be a 'code' parameter in the url by now..."
                const error_description = urlParams.get('error_description') || 'Bad authorization state. Refreshing the page might solve the issue.';
                console.error(error_description);
                setError(error_description);
                logOut();
            }
            else {
                // Request token from auth server with the auth code
                (0, authentication_1.fetchTokens)(config)
                    .then((tokens) => {
                    handleTokenResponse(tokens);
                    window.history.replaceState(null, '', window.location.pathname); // Clear ugly url params
                    // Call any postLogin function in authConfig
                    if (config?.postLogin)
                        config.postLogin();
                })
                    .catch((error) => {
                    setError(error);
                });
            }
        }
        else if (!token) {
            // First page visit
            if (config.autoLogin)
                login();
        }
        else {
            if (decodeToken) {
                try {
                    setTokenData((0, authentication_1.decodeJWT)(token));
                }
                catch (e) {
                    setError(e.message);
                }
            }
            refreshAccessToken(); // Check if token should be updated
        }
    }, []); // eslint-disable-line
    return (react_1.default.createElement(exports.AuthContext.Provider, { value: { tokenData, token, idToken, login, logOut, error, loginInProgress } }, children));
};
exports.AuthProvider = AuthProvider;
