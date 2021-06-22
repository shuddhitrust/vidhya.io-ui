import { NgModule } from '@angular/core';
import { APOLLO_OPTIONS } from 'apollo-angular';
import {
  ApolloClientOptions,
  ApolloLink,
  DefaultOptions,
  InMemoryCache,
  split,
} from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { environment } from 'src/environments/environment';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

const uri = environment.graphql_endpoint;
const ws_uri = environment.websocket_graphql_endpoint;

// const defaultOptions: DefaultOptions = {
//   watchQuery: {
//     fetchPolicy: 'no-cache',
//     errorPolicy: 'ignore',
//   },
//   query: {
//     fetchPolicy: 'no-cache',
//     errorPolicy: 'all',
//   },
// };

export function createApollo(httpLink: HttpLink) {
  const http = httpLink.create({
    uri,
    // withCredentials: true,
  });

  const ws = new WebSocketLink({
    uri: ws_uri,
    options: {
      reconnect: true,
    },
  });

  /**
   * Split the Apollo link to route differently based on the operation type.
   */
  const link: ApolloLink = split(
    // split based on operation type
    ({ query }) => {
      let definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    ws,
    http
  );

  const opts: ApolloClientOptions<any> = {
    link,
    cache: new InMemoryCache(),
    // defaultOptions,
  };

  return opts;
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
