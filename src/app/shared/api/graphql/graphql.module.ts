import { NgModule } from '@angular/core';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { ApolloClientOptions, InMemoryCache, split } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

import { environment } from 'src/environments/environment';
import { localStorageKeys } from '../../common/constants';

let sessionStorageToken = sessionStorage.getItem(
  localStorageKeys.AUTH_TOKEN_KEY
);
let localStorageToken = localStorage.getItem(localStorageKeys.AUTH_TOKEN_KEY);
const token = sessionStorageToken ? sessionStorageToken : localStorageToken;

const uri = environment.graphql_endpoint;
const websocketUri = `${environment.websocket_graphql_endpoint}?token=${token}`;

export function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {
  const http = httpLink.create({
    uri,
  });

  const ws = new WebSocketLink({
    uri: websocketUri,
    options: {
      reconnect: true,
    },
  });

  const link = split(
    ({ query }) => {
      const data = getMainDefinition(query);
      return (
        data.kind === 'OperationDefinition' && data.operation === 'subscription'
      );
    },
    ws,
    http
  );

  return {
    link: link,
    cache: new InMemoryCache(),
  };
}

@NgModule({
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule {}
