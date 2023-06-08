// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// const api_endpoint = 'http://143.244.184.238:8000';
// const websocket_api_endpoint = 'ws://143.244.184.238:8000/';

const baseUrl = 'localhost:8000';
// const baseUrl = 'vidhya-io-staging.herokuapp.com';
// const baseUrl = 'vidhya-io-live-replica.herokuapp.com';
// const baseUrl = '156.67.208.64';

const api_endpoint = `http://${baseUrl}`;
const websocket_api_endpoint = `ws://${baseUrl}/`;
const cloudinary_endpoint = 'https://api.cloudinary.com/v1_1/ragav-dev';
const cloudinary_preset = 'cljckgq2';

export const environment = {
  production: false,
  api_endpoint,
  file_uplod_endpoint: `${cloudinary_endpoint}/upload/`,
  cloudinary_preset,
  googleRedirect_endpoint: `${api_endpoint}/social-auth/login/google-oauth2/`,
  graphql_endpoint: `${api_endpoint}/graphql/`,
  websocket_graphql_endpoint: `${websocket_api_endpoint}/ws/graphql/`,
  oAuthConfig: {
    issuer:'https://accounts.google.com',
    strictDiscoveryDocumentValidation: false,
    clientId: "298234328692-f47a20r8v4cfkceb3308png4999a2mtl.apps.googleusercontent.com",
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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
