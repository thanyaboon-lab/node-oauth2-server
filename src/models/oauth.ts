// models/oauth.js

import mongoose from "mongoose";

mongoose.connect('mongodb://root:example@localhost:27017/oauth?authSource=admin')
const { Schema } = mongoose;

interface User extends mongoose.Document {
  _id: string;
  username: string;
  password: string;
  clerkId: string;
}

interface OAuthClients extends mongoose.Document {
  _id: string;
  userId: string;
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  grants: string[];
}
interface OAuthAuthorizationCodes extends mongoose.Document {
  _id: string;
  authorizationCode: string;
  expiresAt: Date;
  redirectUri: string;
  scope: string;
  clientId: string;
  userId: string;
}
interface OAuthAccessTokens extends mongoose.Document {
  _id: string;
  accessToken: string;
  accessTokenExpiresAt: Date;
  scope: string;
  clientId: string;
  userId: string;
}
interface OAuthRefreshTokens extends mongoose.Document {
  _id: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
  scope: string;
  clientId: string;
  userId: string;
}

/**
 * Schema definitions.
 */
mongoose.model<User>(
  "User",
  new Schema({
    _id: { type: String, auto: true },
    username: { type: String },
    password: { type: String },
    clerkId: { type: String },
  })
);
mongoose.model<OAuthClients>(
  "OAuthClients",
  new Schema({
    _id: { type: String, auto: true },
    clientId: { type: String },
    clientSecret: { type: String },
    callbackUrl: { type: String },
    grants: {
      type: [String],
      required: true,
      enum: ["authorization_code", "refresh_token"],
    },
  }),
  "oauth-clients"
);
mongoose.model<OAuthAuthorizationCodes>(
  "OAuthAuthorizationCodes",
  new Schema({
    _id: { type: String, auto: true },
    authorizationCode: { type: String },
    expiresAt: { type: Date },
    redirectUri: { type: String },
    scope: { type: String },
    clientId: { type: String },
    userId: { type: String },
  }),
  "oauth-authorization-codes"
);

mongoose.model<OAuthAccessTokens>(
  "OAuthAccessTokens",
  new Schema({
    _id: { type: String },
    accessToken: { type: String },
    accessTokenExpiresAt: { type: Date },
    scope: { type: String }, // not sure if this is needed
    clientId: { type: String },
    userId: { type: String },
  }),
  "oauth-access-tokens"
);

mongoose.model<OAuthRefreshTokens>(
  "OAuthRefreshTokens",
  new Schema({
    _id: { type: String },
    refreshToken: { type: String },
    refreshTokenExpiresAt: { type: Date },
    scope: { type: String }, // not sure if this is needed
    clientId: { type: String },
    userId: { type: String },
  }),
  "oauth-refresh-tokens"
);

const UserDb = mongoose.model<User>("User");
const OAuthClientsModel = mongoose.model<OAuthClients>("OAuthClients");
const OAuthAuthorizationCodesModel = mongoose.model<OAuthAuthorizationCodes>(
  "OAuthAuthorizationCodes"
);
const OAuthAccessTokensModel =
  mongoose.model<OAuthAccessTokens>("OAuthAccessTokens");
const OAuthRefreshTokensModel =
  mongoose.model<OAuthRefreshTokens>("OAuthRefreshTokens");

/**
 * Get an OAuth2 Client.
 *
 * Called in 1. Authorization and 4. Refresh Token.
 * 'clientSecret' is defined when refreshing the token.
 */

export {
  UserDb,
  OAuthClientsModel,
  OAuthAuthorizationCodesModel,
  OAuthAccessTokensModel,
  OAuthRefreshTokensModel,
};
