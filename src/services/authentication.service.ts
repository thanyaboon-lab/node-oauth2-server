// services/oauth2.service.js

import OAuth2Server, { Request, Response } from "oauth2-server";
import OAuth from "./authorization.service";
import { OAuthClientsModel, UserDb } from "../models/oauth";
import { NextFunction } from "express";
const server = new OAuth2Server({
  model: OAuth, // See https://github.com/oauthjs/node-oauth2-server for specification
  accessTokenLifetime: 60 * 60,
  // requireClientAuthentication: { password: false, },
});

// IMPORTANT: this the first route to be called in the process.
// node-oauth2-server requires us to define a function called
// `authenticateHandler` that authenticate the user initiating the flow.

// This means that:
// 1. A User is authenticating through a Client, hence you need to search
// for a valid Client in the DB using `client_id` provided as parameter;
// 2. A User is authenticating via the authorization screen (same as you do
// when adding a new app to GitHub and it asks you what organization or
// privileges do you want to grant the app. The bonus of this article is
// that very screen).

// The library says that if you don't need to authenticate the user, you can
// return a falsy value. This didn't work for me so I'm not recommending it
// here.

// Authentication middleware
function isAuthenticated(req: any, res: any, next: NextFunction) {
  console.log('🚀 ~ req.session:', req.session)
  if (req.session && req.session.user) {
    return next();
  } else {
    // Redirect to login page, saving the original request
    res.redirect(`/login?returnUrl=${encodeURIComponent(req.originalUrl)}`);
  }
}

const authorize = async (req: any, res: any) => {
  const request = new Request(req);
  const response = new Response(res);
  return server
    .authorize(request, response, {
      authenticateHandler: {
        handle: async () => {
          console.log("🚀 ~ /authorize:");
          // Present in Flow 1 and Flow 2 ('client_id' is a required for /oauth/authorize
          console.log("🚀 ~ req.session:", req.session);
          console.log("🚀 ~ request.headers:", req.headers);
          console.log("🚀 ~ req.query:", req.query);
          console.log("🚀 ~ req.body:", req.body);
          console.log("🚀 ~ req.auth:", req.auth);
          const { client_id } = req.query || {};
          if (!client_id) throw new Error("Client ID not found");
          const client = await OAuthClientsModel.findOne({
            clientId: client_id,
          });
          console.log("🚀 ~ client:", client);
          if (!client) throw new Error("Client not found");
          // Only present in Flow 2 (authentication screen)
          const { userId } = req.auth || {};

          // At this point, if there's no 'userId' attached to the client or the request doesn't originate from an authentication screen, then do not bind this authorization code to any user, just the client
          if (!client.userId && !userId) return {}; // falsy value
          const user = await UserDb.findOne({
            ...(client.userId && { _id: client.userId }),
            ...(userId && { clientId: userId }),
          });
          console.log("🚀 ~ user:", user);
          if (!user) throw new Error("User not found");
          return { _id: user._id };
        },
      },
    })
    .then((result) => {
      console.log("🚀 ~authorize result:", result);
      res.json(result);
    })
    .catch((err) => {
      console.log("err", err);
      res
        .status(err.code || 500)
        .json(err instanceof Error ? { error: err.message } : err);
    });
};

const token = (req: any, res: any) => {
  const request = new Request(req);
  const response = new Response(res);
  return server
    .token(request, response, { alwaysIssueNewRefreshToken: false })
    .then((result) => {
      console.log("🚀 ~token result:", result);
      res.json(result);
    })
    .catch((err) => {
      console.log("err", err);
      res
        .status(err.code || 500)
        .json(err instanceof Error ? { error: err.message } : err);
    });
};

const authenticate = (req: any, res: any, next: NextFunction) => {
  console.log("🚀 ~ authenticate:");
  const request = new Request(req);
  const response = new Response(res);
  return server
    .authenticate(request, response)
    .then((data) => {
      console.log("🚀 ~ data:", data);
      req.auth = { userId: data?.user?.id, sessionType: "oauth2" };
      next();
    })
    .catch((err) => {
      console.log("err", err);
      res
        .status(err.code || 500)
        .json(err instanceof Error ? { error: err.message } : err);
    });
};

const test = async (req: any, res: any) => {
  const { userId } = req.auth || {};
  if (!userId) throw new Error("User not found");
  const user = await UserDb.findOne({ _id: userId });
  if (!user) throw new Error("User not found");
  res.json({ _id: user._id, username: user.username });
};

const login = async (req: any, res: any) => {
  req.session.user = {
    username: "bambino"
  }
  res.status(200).send('Login SuccessFully');
}

export { server, authorize, token, authenticate, test, isAuthenticated, login };
