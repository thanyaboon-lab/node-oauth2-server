import { BaseClient, Issuer } from 'openid-client';

export default async function discover() {
  let openidConnectDiscoverInternal: Issuer<BaseClient>;
  let openidClientInternal: BaseClient;

  openidConnectDiscoverInternal = await Issuer.discover(
    'http://localhost:3000'
  );
  openidClientInternal = new openidConnectDiscoverInternal.Client({
    client_id: "0a74ad0a0c1bbb4a8612b92b99166be743a18794e212039440084cbe683b6697",
    client_secret: "bc943b92599c2be77b7b7b72ebb99e22e32a480a98b6fbf37728669bdeddcbb9",
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
