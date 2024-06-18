/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import express from 'express';
const router = express.Router();

import { PrismaClient } from "@prisma/client";
import { GRPC as Cerbos } from "@cerbos/grpc";

const prisma = new PrismaClient();

const cerbos = new Cerbos(
    process.env.CERBOS_INSTANCE, // The Cerbos PDP instance,
    { tls: process.env.CERBOS_INSTANCE_TLS === "true" } // TLS options
);

// custom middleware to check auth state
function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.redirect('/auth/signin'); // redirect to sign-in route
    }
    next();
}

// Use Cerbos to validate if user can perform the action
function isAuthorized(action) {
    return async (req, res, next) => {

        // Get principal from session
        const principal = {
            id: req.session.account.idTokenClaims.oid,
            roles: req.session.account.idTokenClaims.roles ? req.session.account.idTokenClaims.roles : ['Posts.User'], // Default role is Posts.User
        };

        // Get the resource
        // If action on specif resource - get the resource id from params 
        const instanceId = req.params.id ? req.params.id : null;
        let attr = {};

        if (instanceId) {
            const post = await prisma.post.findUnique({
                where: {
                    id: Number(instanceId),
                },
            });

            console.log(post);

            attr = {
                authorId: post.authorId,
                published: post.published,
            };
        }

        const resource = {
            kind: "post",
            id: instanceId ? instanceId : 'any',
            attr: attr,
        };

        const cerbosPayload = {
            principal,
            resource,
            action: action,
        };

        console.log('cerbosPayload', cerbosPayload);
        const decision = await cerbos.isAllowed(cerbosPayload);

        if (!decision) {
            return res.status(403).send('Unauthorized');
        }

        next();
    };
}

router.get(
    '/',
    isAuthenticated, // check if user is authenticated
    isAuthorized('read'),
    async function (req, res, next) {
        const posts = await prisma.post.findMany();
        res.render('posts', { 'posts': posts });
    }
);

//Create Post
router.post(
    '/',
    isAuthenticated,
    isAuthorized('create'),
    async function (req, res, next) {
        const { title, content } = req.body;
        const body = {
            title,
            content,
            authorId: req.session.account.idTokenClaims.oid,
            organizationId: req.session.account.idTokenClaims.groups ? req.session.account.idTokenClaims.groups[0] : "0", //TODO: Multi-tenant support - 0 default
        };

        await prisma.post.create({
            data: body,
        });

        return res.redirect('/posts');
    }
);

router.put(
    '/:id',
    isAuthenticated,
    isAuthorized('update'),
    async function (req, res, next) {
        const postId = req.params.id;

        await prisma.post.update({
            where: {
                id: Number(postId),
            },
            data: {
                published: JSON.parse(req.body.published),
            },
        });

        return res.redirect('/posts');
    }
);

router.delete(
    '/:id',
    isAuthenticated,
    isAuthorized('delete'),
    async function (req, res, next) {
        const postId = parseInt(req.params.id);
        await prisma.post.delete({
            where: {
                id: Number(postId),
            },
        });

        return res.redirect('/posts');
    }
);

export default router;
