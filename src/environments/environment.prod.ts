const api_endpoint = '';
const websocket_api_endpoint = '';
export const environment = {
  production: false,
  api_endpoint,
  file_uplod_endpoint: `${api_endpoint}/upload/`,
  graphql_endpoint: `${api_endpoint}/graphql/`,
  websocket_graphql_endpoint: `${websocket_api_endpoint}/graphql/`,
};
