import { ReactNode } from 'react';
interface TTokenRqBase {
    grant_type: string;
    scope: string;
    client_id: string;
    redirect_uri: string;
}
export interface TTokenRequestWithCodeAndVerifier extends TTokenRqBase {
    code: string;
    code_verifier: string;
}
export interface TTokenRequestForRefresh extends TTokenRqBase {
    refresh_token: string;
}
export declare type TTokenRequest = TTokenRequestWithCodeAndVerifier | TTokenRequestForRefresh;
export declare type TTokenData = {
    [x: string]: any;
};
export declare type TTokenResponse = {
    access_token: string;
    scope: string;
    token_type: string;
    expires_in?: number;
    refresh_token?: string;
    refresh_token_expires_in?: number;
    id_token?: string;
};
export interface IAuthProvider {
    authConfig: TAuthConfig;
    children: ReactNode;
}
export interface IAuthContext {
    token: string;
    logOut: () => void;
    login: () => void;
    error: string | null;
    tokenData?: TTokenData;
    idToken?: string;
    loginInProgress: boolean;
}
export declare type TAuthConfig = {
    clientId: string;
    authorizationEndpoint: string;
    tokenEndpoint: string;
    redirectUri: string;
    scope?: string;
    logoutEndpoint?: string;
    logoutRedirect?: string;
    preLogin?: () => void;
    postLogin?: () => void;
    decodeToken?: boolean;
    autoLogin?: boolean;
    extraAuthParams?: {
        [key: string]: string | boolean | number;
    };
};
export declare type TAzureADErrorResponse = {
    error_description: string;
    [k: string]: unknown;
};
export declare type TInternalConfig = {
    clientId: string;
    authorizationEndpoint: string;
    tokenEndpoint: string;
    redirectUri: string;
    scope: string;
    preLogin?: () => void;
    postLogin?: () => void;
    decodeToken: boolean;
    autoLogin: boolean;
    extraAuthParams?: {
        [key: string]: string | boolean | number;
    };
};
export {};
