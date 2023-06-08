// const api_endpoint = '';
// const websocket_api_endpoint = '';
// export const environment = {
//   production: false,
//   api_endpoint,
//   file_uplod_endpoint: `${api_endpoint}/upload/`,
//   graphql_endpoint: `${api_endpoint}/graphql/`,
//   websocket_graphql_endpoint: `${websocket_api_endpoint}/graphql/`,
// };

const base_url = 'vidhya-io.herokuapp.com';

const api_endpoint = `https://${base_url}`;
const websocket_api_endpoint = `wss://${base_url}`;
const cloudinary_endpoint = 'https://api.cloudinary.com/v1_1/svidhya';
const cloudinary_preset = 'l4vdzicq';

export const environment = {
  production: true,
  api_endpoint,
  file_uplod_endpoint: `${cloudinary_endpoint}/upload/`,
  cloudinary_preset,
  googleRedirect_endpoint: `${api_endpoint}/social-auth/login/google-oauth2/`,
  graphql_endpoint: `${api_endpoint}/graphql/`,
  websocket_graphql_endpoint: `${websocket_api_endpoint}/ws/graphql/`,
};
