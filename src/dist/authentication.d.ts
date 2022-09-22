import { TInternalConfig, TTokenData, TTokenResponse } from './Types';
export declare const EXPIRED_REFRESH_TOKEN_ERROR_CODES: string[];
export declare function redirectToLogin(config: TInternalConfig): Promise<void>;
export declare const fetchTokens: (config: TInternalConfig) => Promise<TTokenResponse>;
export declare const fetchWithRefreshToken: (props: {
    config: TInternalConfig;
    refreshToken: string;
}) => Promise<TTokenResponse>;
/**
 * Decodes the base64 encoded JWT. Returns a TToken.
 */
export declare const decodeJWT: (token: string) => TTokenData;
export declare const epochAtSecondsFromNow: (secondsFromNow: number) => number;
/**
 * Check if the Access Token has expired.
 * Will return True if the token has expired, OR there is less than 5min until it expires.
 */
export declare function epochTimeIsPast(timestamp: number): boolean;
export declare const errorMessageForExpiredRefreshToken: (errorMessage: string) => boolean;
