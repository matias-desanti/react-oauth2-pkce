import React from 'react';
import { IAuthContext, IAuthProvider } from './Types';
export declare const AuthContext: React.Context<IAuthContext>;
export declare const AuthProvider: ({ authConfig, children }: IAuthProvider) => JSX.Element;
