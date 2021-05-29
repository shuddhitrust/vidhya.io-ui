import { gql } from 'apollo-angular';

export const USER_MUTATIONS = {
  CREATE_USER: gql`
    mutation createUser($input: UserInput!) {
      createUser(input: $input) {
        ok
        user
      }
    }
  `,
  UPDATE_USER: gql`
    mutation updateUser($input: UserInput!) {
      updateUser(input: $input) {
        ok
        user
      }
    }
  `,
  DELETE_USER: gql`
    mutation deleteUser($id: ID!) {
      deleteUser(id: $id) {
        ok
        user
      }
    }
  `,
};

export const INSTITUTION_MUTATIONS = {
  CREATE_INSTITUTION: gql`
    mutation createInstitution($input: InstitutionInput!) {
      createInstitution(input: $input) {
        ok
        institution {
          id
          name
        }
      }
    }
  `,
  UPDATE_INSTITUTION: gql`
    mutation updateInstitution($id: Int!, $input: InstitutionInput!) {
      updateInstitution(id: $id, input: $input) {
        ok
        institution {
          id
          name
        }
      }
    }
  `,
  DELETE_INSTITUTION: gql`
    mutation deleteInstitution($id: ID!) {
      deleteInstitution(id: $id) {
        ok
        institution {
          id
          name
        }
      }
    }
  `,
};

export const GROUP_MUTATIONS = {
  CREATE_GROUP: gql`
    mutation createGroup($input: GroupInput!) {
      createGroup(input: $input) {
        ok
        group {
          id
          name
        }
      }
    }
  `,
  UPDATE_GROUP: gql`
    mutation updateGroup($id: Int!, $input: GroupInput!) {
      updateGroup(id: $id, input: $input) {
        ok
        group {
          id
          name
        }
      }
    }
  `,
  DELETE_GROUP: gql`
    mutation deleteGroup($id: ID!) {
      deleteGroup(id: $id) {
        ok
        group {
          id
          name
        }
      }
    }
  `,
};

export const AUTH_MUTATIONS = {
  REGISTER: gql`
    mutation register(
      $username: String!
      $email: String!
      $password1: String!
      $password2: String!
    ) {
      register(
        username: $username
        email: $email
        password1: $password1
        password2: $password2
      ) {
        success
        errors
        token
        refreshToken
      }
    }
  `,
  VERIFY_ACCOUNT: gql`
    mutation verifyAccount($token: String!) {
      verifyAccount(token: $token) {
        success
        errors
      }
    }
  `,
  RESEND_ACTIVATION_EMAIL: gql`
    mutation resendActivationEmail($email: String!) {
      resendActivationEmail(email: $email) {
        success
        errors
      }
    }
  `,
  LOGIN: gql`
    mutation tokenAuth($username: String!, $password: String!) {
      tokenAuth(username: $username, password: $password) {
        success
        errors
        token
        refreshToken
        user {
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
    }
  `,
  VERIFY_TOKEN: gql`
    mutation verifyToken($token: String!) {
      verifyToken(token: $token) {
        success
        errors
      }
    }
  `,
  REFRESH_TOKEN: gql`
    mutation refreshToken($refreshToken: String!) {
      refreshToken(refreshToken: $refreshToken) {
        success
        errors
        token
        refreshToken
      }
    }
  `,
  REVOKE_TOKEN: gql`
    mutation revokeToken($refreshToken: String!) {
      revokeToken(refreshToken: $refreshToken) {
        success
        errors
      }
    }
  `,
  SEND_PASSWORD_RESET_EMAIL: gql`
    mutation sendPasswordResetEmail($email: String!) {
      sendPasswordResetEmail(email: $email) {
        success
        errors
      }
    }
  `,
  PASSWORD_RESET: gql`
    mutation passwordReset(
      $token: String!
      $newPassword1: String!
      $newPassword2: String!
    ) {
      passwordReset(
        token: $token
        newPassword1: $newPassword1
        newPassword2: $newPassword2
      ) {
        success
        errors
      }
    }
  `,
  PASSWORD_CHANGE: gql`
    mutation passwordChange(
      $oldPassword: String!
      $newPassword1: String!
      $newPassword2: String!
    ) {
      passwordChange(
        oldPassword: $oldPassword
        newPassword1: $newPassword1
        newPassword2: $newPassword2
      ) {
        success
        errors
        token
        refreshToken
      }
    }
  `,
};
