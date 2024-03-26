import {v4 as uuid} from "uuid";
import OAuth2Server from "oauth2-server";
import { OAuthAccessTokensModel, OAuthAuthorizationCodesModel, OAuthClientsModel, OAuthRefreshTokensModel } from "../models/oauth";

async function getClient(clientId: string, clientSecret: string): Promise<OAuth2Server.Client | OAuth2Server.Falsey> {
  console.log('🚀 ~ getClient clientId:', clientId)
    console.log('🚀 ~ getClient clientSecret:', clientSecret)
    const client = await OAuthClientsModel.findOne({clientId, ...(clientSecret && {clientSecret})}).lean();
    if (!client) throw new Error("Client not found");
  
    return {
      id: client.clientId,
      grants: client.grants,
      redirectUris: [client.callbackUrl]
    };
  }
  
  /**
   * Verify Scope.
   */
  
  async function verifyScope(token: OAuth2Server.Token, scope: string) {
      console.log('🚀 ~ verifyScope scope:', scope)
      console.log('🚀 ~ verifyScope token:', token)
      if (!token.scope) {
        return false;
      }
      let requestedScopes = scope.split(' ');
      let authorizedScopes = (token.scope as string).split(' ');
      return requestedScopes.every(s => authorizedScopes.indexOf(s) >= 0);
    }
  
  /**
   * Save authorization code.
   */
  async function saveAuthorizationCode(code: OAuth2Server.AuthorizationCode, client: OAuth2Server.Client, user: OAuth2Server.User): Promise<OAuth2Server.AuthorizationCode> {
    console.log('🚀 ~ saveAuthorizationCode code:', code)
    console.log('🚀 ~ saveAuthorizationCode client:', client)
    console.log('🚀 ~ saveAuthorizationCode user:', user)
    const authorizationCode = {
      authorizationCode: code.authorizationCode,
      expiresAt: code.expiresAt,
      redirectUri: code.redirectUri,
      scope: code.scope,
      clientId: client.id,
      userId: user._id,
      user,
      client
    };
    await OAuthAuthorizationCodesModel.create({_id: uuid(), ...authorizationCode});
    return authorizationCode;
  }
  
  /**
   * Get authorization code.
   */
  async function getAuthorizationCode(authorizationCode: string): Promise<OAuth2Server.AuthorizationCode> {
    console.log('🚀 ~ getAuthorizationCode authorizationCode:', authorizationCode)
    const code = await OAuthAuthorizationCodesModel.findOne({authorizationCode}).lean();
    if (!code) throw new Error("Authorization code not found");
  
    return {
      authorizationCode: code.authorizationCode,
      code: code.authorizationCode,
      expiresAt: code.expiresAt,
      redirectUri: code.redirectUri,
      scope: code.scope,
      client: {id: code.clientId, grants: ["authorization_code"] },
      user: {id: code.userId}
    };
  }
  
  /**
   * Revoke authorization code.
   */
  async function revokeAuthorizationCode({ code }: OAuth2Server.AuthorizationCode) {
    console.log('🚀 ~ revokeAuthorizationCode:', code)
    const res = await OAuthAuthorizationCodesModel.deleteOne({authorizationCode: code});
    return res.deletedCount === 1;
  }
  
  /**
   * Revoke a refresh token.
   */
  async function revokeToken({ refreshToken }: OAuth2Server.Token) {
    console.log('🚀 ~ revokeToken refreshToken:', refreshToken)
    const res = await OAuthAccessTokensModel.deleteOne({refreshToken});
    return res.deletedCount === 1;
  }
  
  /**
   * Save token.
   */
  async function saveToken(token: OAuth2Server.Token, client: OAuth2Server.Client, user: OAuth2Server.User): Promise<OAuth2Server.Token> {
    console.log('🚀 ~ saveToken token:', token)
    console.log('🚀 ~ saveToken client:', client)
    console.log('🚀 ~ saveToken user:', user)
    await OAuthAccessTokensModel.create({
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      scope: token.scope,
      _id: uuid(),
      clientId: client.id,
      userId: user.id
    });
  
    if (token.refreshToken) {
      await OAuthRefreshTokensModel.create({
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        scope: token.scope,
        _id: uuid(),
        clientId: client.id,
        userId: user.id
      });
    }
  
    return {
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      refreshToken: token.refreshToken,
      refreshTokenExpiresAt: token.refreshTokenExpiresAt,
      scope: token.scope,
      client: {id: client.id, grants: ["authorization_code"]},
      user: {id: user.id},
  
      // other formats, i.e. for Zapier
      access_token: token.accessToken,
      refresh_token: token.refreshToken
    };
  }
  
  /**
   * Get access token.
   */
  async function getAccessToken(accessToken: string): Promise<OAuth2Server.Token> {
    console.log('🚀 ~ getAccessToken:', accessToken)
    const token = await OAuthAccessTokensModel.findOne({accessToken}).lean();
    if (!token) throw new Error("Access token not found");
  
    return {
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      scope: token.scope,
      client: {id: token.clientId, grants: ["authorization_code"]},
      user: {id: token.userId}
    };
  }
  
  /**
   * Get refresh token.
   */
  async function getRefreshToken(refreshToken: string): Promise<OAuth2Server.RefreshToken | OAuth2Server.Falsey> {
    console.log('🚀 ~ getRefreshToken:', refreshToken)
    const token = await OAuthRefreshTokensModel.findOne({refreshToken}).lean();
    if (!token) throw new Error("Refresh token not found");
  
    return {
      refreshToken: token.refreshToken,
      // refreshTokenExpiresAt: token.refreshTokenExpiresAt, // never expires
      scope: token.scope,
      client: {id: token.clientId, grants: ["authorization_code"]},
      user: {id: token.userId}
    };
  }
  
  export default {
    saveToken,
    verifyScope,
    saveAuthorizationCode,
    revokeAuthorizationCode,
    revokeToken,
    getAuthorizationCode,
    getAccessToken,
    getClient,
    getRefreshToken,
  } as OAuth2Server.AuthorizationCodeModel;