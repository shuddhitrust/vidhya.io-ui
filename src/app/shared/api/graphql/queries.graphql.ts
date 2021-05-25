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
  GET_USERS: gql`
    query users {
      users {
        username
        id
        name
        title
        bio
        institution {
          id
          name
        }
        lastLogin
      }
    }
  `,
};

export const INSTITUTION_QUERIES = {
  GET_INSTITUTION: gql`
    query institution($id: Int!) {
      institution(id: $id) {
        id
        name
        location
        city
        website
        phone
        logo
        bio
        invitecode
      }
    }
  `,
  GET_INSTITUTIONS: gql`
    query institutions($input: any) {
      institutions(input: $input) {
        id
        name
        location
        city
        bio
      }
    }
  `,
};
