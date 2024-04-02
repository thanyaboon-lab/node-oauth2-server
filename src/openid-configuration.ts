import fs from 'fs/promises'
import { pem2jwk } from 'pem-jwk'
import type { Request, Response } from 'express'

const openidConfigurationDefault = {
    issuer: 'http://localhost:3000',
    authorization_endpoint: 'http://localhost:3000/oauth/authorize',
    token_endpoint: 'http://localhost:3000/oauth/token',
    userinfo_endpoint: 'http://localhost:3000/userinfo',
    jwks_uri: 'http://localhost:3000/.well-known/openid-configuration/jwks',
    response_types_supported: ['code', 'token', 'id_token', 'code token', 'code id_token'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['RS256'],
};

export const openidConfiguration = async (req: Request, res: Response) => {
    return res.json(openidConfigurationDefault)
}

export const jwks = async (req: Request, res: Response) => {
    const publicKey = await fs.readFile('public_key.pem', 'utf8');
    const jwk = pem2jwk(publicKey);
    return res.json({keys: [jwk]})
}

