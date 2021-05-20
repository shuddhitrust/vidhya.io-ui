import { gql } from 'apollo-angular';

export const LOGIN = gql`
<<<<<<< HEAD
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
=======
{
    
}`;
>>>>>>> 15f5f394940554a3cd671c24b0d8208ab7b6c831
