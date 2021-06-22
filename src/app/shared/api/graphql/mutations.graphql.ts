import { gql } from 'apollo-angular';

export const USER_MUTATIONS = {
  // CREATE_USER: gql`
  //   mutation createUser($input: UserInput!) {
  //     createUser(input: $input) {
  //       ok
  //       user {
  //         id
  //         firstName
  //       }
  //     }
  //   }
  // `,
  UPDATE_USER: gql`
    mutation updateUser($input: UserInput!) {
      updateUser(input: $input) {
        ok
        user {
          id
          username
          firstName
          lastName
          avatar
          invitecode
          email
          institution {
            id
            name
          }
          membershipStatus
        }
      }
    }
  `,
  DELETE_USER: gql`
    mutation deleteUser($id: ID!) {
      deleteUser(id: $id) {
        ok
        user {
          id
          firstName
        }
      }
    }
  `,
};

export const USER_ROLE_MUTATIONS = {
  CREATE_USER_ROLE: gql`
    mutation createUserRole($input: UserRoleInput!) {
      createUserRole(input: $input) {
        ok
        userRole {
          id
          name
        }
      }
    }
  `,
  UPDATE_USER_ROLE: gql`
    mutation updateUserRole($id: ID!, $input: UserRoleInput!) {
      updateUserRole(id: $id, input: $input) {
        ok
        userRole {
          id
          name
        }
      }
    }
  `,
  DELETE_USER_ROLE: gql`
    mutation deleteUserRole($id: ID!) {
      deleteUserRole(id: $id) {
        ok
        userRole {
          id
          name
        }
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
    mutation updateInstitution($id: ID!, $input: InstitutionInput!) {
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
    mutation updateGroup($id: ID!, $input: GroupInput!) {
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

export const ANNOUNCEMENT_MUTATIONS = {
  CREATE_ANNOUNCEMENT: gql`
    mutation createAnnouncement($input: AnnouncementInput!) {
      createAnnouncement(input: $input) {
        ok
        announcement {
          id
          title
        }
      }
    }
  `,
  UPDATE_ANNOUNCEMENT: gql`
    mutation updateAnnouncement($id: ID!, $input: AnnouncementInput!) {
      updateAnnouncement(id: $id, input: $input) {
        ok
        announcement {
          id
          title
        }
      }
    }
  `,
  DELETE_ANNOUNCEMENT: gql`
    mutation deleteAnnouncement($id: ID!) {
      deleteAnnouncement(id: $id) {
        ok
        announcement {
          id
          title
        }
      }
    }
  `,
};

export const COURSE_MUTATIONS = {
  CREATE_COURSE: gql`
    mutation createCourse($input: CourseInput!) {
      createCourse(input: $input) {
        ok
        course {
          id
          title
        }
      }
    }
  `,
  UPDATE_COURSE: gql`
    mutation updateCourse($id: ID!, $input: CourseInput!) {
      updateCourse(id: $id, input: $input) {
        ok
        course {
          id
          title
        }
      }
    }
  `,
  DELETE_COURSE: gql`
    mutation deleteCourse($id: ID!) {
      deleteCourse(id: $id) {
        ok
        course {
          id
          title
        }
      }
    }
  `,
};

export const ASSIGNMENT_MUTATIONS = {
  CREATE_ASSIGNMENT: gql`
    mutation createAssignment($input: AssignmentInput!) {
      createAssignment(input: $input) {
        ok
        assignment {
          id
          title
        }
      }
    }
  `,
  UPDATE_ASSIGNMENT: gql`
    mutation updateAssignment($id: ID!, $input: AssignmentInput!) {
      updateAssignment(id: $id, input: $input) {
        ok
        assignment {
          id
          title
        }
      }
    }
  `,
  DELETE_ASSIGNMENT: gql`
    mutation deleteAssignment($id: ID!) {
      deleteAssignment(id: $id) {
        ok
        assignment {
          id
          title
        }
      }
    }
  `,
};

export const CHAT_MUTATIONS = {
  CREATE_CHAT: gql`
    mutation createChat($input: ChatInput!) {
      createChat(input: $input) {
        ok
        chat {
          id
          name
        }
      }
    }
  `,
  UPDATE_CHAT: gql`
    mutation updateChat($id: ID!, $input: ChatInput!) {
      updateChat(id: $id, input: $input) {
        ok
        chat {
          id
          name
        }
      }
    }
  `,
  DELETE_CHAT: gql`
    mutation deleteChat($id: ID!) {
      deleteChat(id: $id) {
        ok
        chat {
          id
          name
        }
      }
    }
  `,
  CHAT_WITH_MEMBER: gql`
    mutation chatWithMember($id: ID!) {
      chatWithMember(id: $id) {
        ok
        chat {
          id
          name
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
          chatmessageSet {
            id
            message
            author {
              id
              firstName
              lastName
              avatar
            }
            createdAt
            seenBy {
              id
              firstName
              lastName
            }
          }
          createdAt
        }
      }
    }
  `,
};

export const CHAT_MESSAGE_MUTATIONS = {
  CREATE_CHAT_MESSAGE: gql`
    mutation createChatMessage($chat: ID!, $message: String!, $author: ID!) {
      createChatMessage(chat: $chat, message: $message, author: $author) {
        ok
        chatMessage {
          id
          chat {
            id
            name
            members {
              id
              firstName
              lastName
            }
            chatmessageSet {
              id
              message
              author {
                id
                firstName
                lastName
                avatar
              }
              createdAt
              seenBy {
                id
                firstName
                lastName
              }
              createdAt
              seenBy {
                firstName
              }
            }
          }
        }
      }
    }
  `,
  UPDATE_CHAT_MESSAGE: gql`
    mutation updateChatMessage($id: ID!, $input: ChatInput!) {
      updateChatMessage(id: $id, input: $input) {
        ok
        chatMessages {
          id
          message
          author {
            id
            firstName
          }
        }
      }
    }
  `,
  DELETE_CHAT_MESSAGE: gql`
    mutation deleteChatMessage($id: ID!) {
      deleteChatMessage(id: $id) {
        ok
        chatMessages {
          id
          message
          author {
            id
            firstName
          }
        }
      }
    }
  `,
};

export const AUTH_MUTATIONS = {
  VERIFY_INVITECODE: gql`
    mutation verifyInvitecode($invitecode: String!) {
      verifyInvitecode(invitecode: $invitecode) {
        ok
      }
    }
  `,
  ADD_INVITECODE: gql`
    mutation addInvitecode($invitecode: String!, $email: String!) {
      addInvitecode(invitecode: $invitecode, email: $email) {
        ok
      }
    }
  `,
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
          firstName
          lastName
          avatar
          invitecode
          email
          institution {
            id
            name
          }
          role {
            name
            permissions
          }
          membershipStatus
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
