import { BaseClient, Issuer } from 'openid-client';

export default async function discover() {
  let openidConnectDiscoverInternal: Issuer<BaseClient>;
  let openidClientInternal: BaseClient;

  openidConnectDiscoverInternal = await Issuer.discover(
    'http://localhost:3000'
  );
  openidClientInternal = new openidConnectDiscoverInternal.Client({
    client_id: "clientId",
    client_secret: "clientSecret",
  });
  console.log('🚀 ~ openidClientInternal:', openidClientInternal)

  const redirectUrl = openidClientInternal.authorizationUrl({
    scope: "openid profile offline_access",
    state: "test",
    response_type: "code",
    // access_type: 'offline',
    redirect_uri: "http://localhost:3000/callback",
  });
  console.log("🚀 ~ redirectUrl:", redirectUrl);
}
