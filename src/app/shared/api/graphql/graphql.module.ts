import { Component, NgModule } from '@angular/core';
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
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { localStorageKeys } from '../../common/constants';
import { AuthState } from 'src/app/modules/auth/state/auth.state';

const uri = environment.graphql_endpoint;
let token = sessionStorage.getItem(localStorageKeys.AUTH_TOKEN_KEY);

// let ws = new WebSocketLink({
//   uri: `${environment.websocket_graphql_endpoint}?token=${token}`,
//   options: {
//     reconnect: true,
//   },
// });

// @NgModule()
// export class TokenUpdater {
//   @Select(AuthState.getToken)
//   token$: Observable<string>;
//   token;
//   constructor() {
//     this.token$.subscribe((val) => {
//       this.token = val;
//       token = this.token;
//       if (token != null) {
//         ws = new WebSocketLink({
//           uri: `${environment.websocket_graphql_endpoint}?token=${token}`,
//           options: {
//             reconnect: true,
//           },
//         });
//       }
//     });
//   }
// }

export function createApollo(httpLink: HttpLink) {
  const http = httpLink.create({
    uri,
    // withCredentials: true,
  });

  /**
   * This is for usage while subscriptions are enabled
   */
  // /**
  //  * Split the Apollo link to route differently based on the operation type.
  //  */
  // const link: ApolloLink = split(
  //   // split based on operation type
  //   ({ query }) => {
  //     let definition = getMainDefinition(query);
  //     return (
  //       definition.kind === 'OperationDefinition' &&
  //       definition.operation === 'subscription'
  //     );
  //   },
  //   ws,
  //   http
  // );

  const link = http; // This is for usage while disabling subscriptions

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
