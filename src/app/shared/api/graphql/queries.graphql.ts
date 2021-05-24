import { gql } from 'apollo-angular';

export const AUTH_QUERIES = {
  ME: gql`
    query me {
      me {
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
  `,
};

export const USER_QUERIES = {
  GET_USER: gql`
    query user($id: Int!) {
      user(id: $id) {
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
  `,
};
