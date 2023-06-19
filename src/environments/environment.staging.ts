// const api_endpoint = '';
// const websocket_api_endpoint = '';
// export const environment = {
//   production: false,
//   api_endpoint,
//   file_uplod_endpoint: `${api_endpoint}/upload/`,
//   graphql_endpoint: `${api_endpoint}/graphql/`,
//   websocket_graphql_endpoint: `${websocket_api_endpoint}/graphql/`,
// };

const base_url = 'vidhya-io-api-mw7x.onrender.com';

const api_endpoint = `https://${base_url}`;
const websocket_api_endpoint = `wss://${base_url}`;
const cloudinary_endpoint = 'https://api.cloudinary.com/v1_1/ragav-dev';
const cloudinary_preset = 'cljckgq2';

export const environment = {
  production: true,
  api_endpoint,
  file_uplod_endpoint: `${cloudinary_endpoint}/upload/`,
  cloudinary_preset,
  googleRedirect_endpoint: `${api_endpoint}/social-auth/login/google-oauth2/`,
  graphql_endpoint: `${api_endpoint}/graphql/`,
  websocket_graphql_endpoint: `${websocket_api_endpoint}/ws/graphql/`,
  oAuthConfig: {
    issuer:'https://accounts.google.com',
    strictDiscoveryDocumentValidation: false,
    clientId: "573998369995-1sdq6uuj9kit90c73s959rnvrko3a8gr.apps.googleusercontent.com",
    showDebugInformation: true,
    redirectUri:window.location.origin,
    clearHashAfterLogin: true,
    scope:'openid profile email https://www.googleapis.com/auth/gmail.readonly',
    silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
    useSilentRefresh: true, // Needed for Code Flow to suggest using iframe-based refreshes
    sessionChecksEnabled: true,
    nonceStateSeparator: 'semicolon', // Real semicolon gets mangled by IdentityServer's URI encoding
    requireHttps: true,
  }
};
