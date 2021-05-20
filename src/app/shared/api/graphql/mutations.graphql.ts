import { gql } from 'apollo-angular';

export const LOGIN = gql`
  mutation tokenAuth($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      success
      errors
      token
      refreshToken
      user {
        username
        name
        email
        institution {
          id
          name
        }
        lastLogin
      }
    }
  }
`;
