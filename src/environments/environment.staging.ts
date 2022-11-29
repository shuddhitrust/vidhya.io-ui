// const api_endpoint = '';
// const websocket_api_endpoint = '';
// export const environment = {
//   production: false,
//   api_endpoint,
//   file_uplod_endpoint: `${api_endpoint}/upload/`,
//   graphql_endpoint: `${api_endpoint}/graphql/`,
//   websocket_graphql_endpoint: `${websocket_api_endpoint}/graphql/`,
// };

const api_endpoint = 'https://vidhya-io-staging.herokuapp.com';
const websocket_api_endpoint = 'wss://vidhya-io-staging.herokuapp.com';
const cloudinary_endpoint = 'https://api.cloudinary.com/v1_1/ragav-dev';
const cloudinary_preset = 'cljckgq2';

export const environment = {
  production: true,
  api_endpoint,
  file_uplod_endpoint: `${cloudinary_endpoint}/upload/`,
  cloudinary_preset,
  graphql_endpoint: `${api_endpoint}/graphql/`,
  websocket_graphql_endpoint: `${websocket_api_endpoint}/ws/graphql/`,
};
