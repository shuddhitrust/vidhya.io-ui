import { gql } from 'apollo-angular';

export const AUTH_QUERIES = {
  ME: gql`
    query me {
      me {
        username
        nickName
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
    query user($id: ID!) {
      user(id: $id) {
        username
        nickName
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
    query users($searchField_Icontains: String, $limit: Int, $offset: Int) {
      users(
        searchField_Icontains: $searchField_Icontains
        limit: $limit
        offset: $offset
      ) {
        username
        id
        nickName
        title
        bio
        institution {
          id
          name
        }
        lastActive
        totalCount
      }
    }
  `,
};

export const INSTITUTION_QUERIES = {
  GET_INSTITUTION: gql`
    query institution($id: ID!) {
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
    query institutions(
      $searchField_Icontains: String
      $limit: Int
      $offset: Int
    ) {
      institutions(
        searchField_Icontains: $searchField_Icontains
        limit: $limit
        offset: $offset
      ) {
        id
        name
        location
        city
        bio
        totalCount
      }
    }
  `,
};

export const GROUP_QUERIES = {
  GET_GROUP: gql`
    query group($id: ID!) {
      group(id: $id) {
        id
        name
        description
        institution {
          id
        }
        groupType
        admins {
          id
          firstName
          lastName
        }
        members {
          id
          firstName
          lastName
        }
      }
    }
  `,
  GET_GROUPS: gql`
    query groups($searchField_Icontains: String, $limit: Int, $offset: Int) {
      groups(
        searchField_Icontains: $searchField_Icontains
        limit: $limit
        offset: $offset
      ) {
        id
        name
        description
      }
    }
  `,
};
