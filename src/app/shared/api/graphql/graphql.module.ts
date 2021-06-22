import { NgModule } from '@angular/core';
import { APOLLO_OPTIONS } from 'apollo-angular';
import {
  ApolloClientOptions,
  ApolloLink,
  InMemoryCache,
  split,
} from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { environment } from 'src/environments/environment';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

const uri = environment.graphql_endpoint;
const ws_uri = environment.websocket_graphql_endpoint;
export function createApollo(httpLink: HttpLink) {
  const http = httpLink.create({
    uri,
    withCredentials: true,
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

// import { NgModule } from '@angular/core';
// import { APOLLO_OPTIONS } from 'apollo-angular';
// import { ApolloClientOptions, split, InMemoryCache } from '@apollo/client/core';
// import { HttpLink } from 'apollo-angular/http';
// import { WebSocketLink } from '@apollo/client/link/ws';
// import { environment } from 'src/environments/environment';
// import { getMainDefinition } from '@apollo/client/utilities';

// const uri = environment.graphql_endpoint;
// export function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {
//   // Create an http link:
//   const http = httpLink.create({
//     uri,
//   });

//   // Create a WebSocket link:
//   const ws = new WebSocketLink({
//     uri,
//     options: {
//       reconnect: true,
//       // connectionParams: {
//       //   authToken: user.authToken,
//       // },
//     },
//   });

//   // using the ability to split links, you can send data to each link
//   // depending on what kind of operation is being sent
//   const link = split(
//     // split based on operation type
//     ({ query }) => {
//       const definition = getMainDefinition(query);
//       return (
//         definition.kind === 'OperationDefinition' &&
//         definition.operation === 'subscription'
//       );
//     },
//     ws,
//     http
//   );
//   return {
//     link,
//     cache: new InMemoryCache(),
//   };
// }

// @NgModule({
//   providers: [
//     {
//       provide: APOLLO_OPTIONS,
//       useFactory: createApollo,
//       deps: [HttpLink],
//     },
//   ],
// })
// export class GraphQLModule {}
