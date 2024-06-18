import express from 'express';
import authProvider  from '../auth/AuthProvider.js';

export const signIn = async (req, res, next) => {
    return authProvider.login(req, res, next);
};

export const handleRedirect = async (req, res, next) => {
    return authProvider.handleRedirect(req, res, next);
}

export const signOut = async (req, res, next) => {
    return authProvider.logout(req, res, next);
};

export default { signIn, signOut, handleRedirect };