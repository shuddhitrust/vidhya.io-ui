import { gql } from 'apollo-angular';

export const AUTH = {
  REGISTER: gql`
    mutation register($username: String!, email: String!, password1: String!, password2: String!) {
      register(username: $username, email: $email, password1: $password1, password2: $password2,) {
        success,
        errors,
        token,
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
      success
      errors
    }
  `,
  PASSWORD_CHANGE: gql`
    mutation passwordChange(
      $oldPassword: String!
      $newPassword1: String!
      $newPassword2: String!
    ) {
      success
      errors
      token
      refreshToken
    }
  `,
};
