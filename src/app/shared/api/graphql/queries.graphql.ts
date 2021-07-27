import { gql } from 'apollo-angular';

export const AUTH_QUERIES = {
  ME: gql`
    query me {
      me {
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
          id
          name
          permissions
        }
        membershipStatus
      }
    }
  `,
  GET_INSTITUTION_BY_INVITECODE: gql`
    query institutionByInvitecode($invitecode: String!) {
      institutionByInvitecode(invitecode: $invitecode) {
        id
        name
      }
    }
  `,
};

export const USER_QUERIES = {
  GET_USER: gql`
    query user($id: ID!) {
      user(id: $id) {
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
          id
          name
          permissions
        }
        membershipStatus
      }
    }
  `,
  GET_USERS: gql`
    query users(
      $searchField: String
      $membershipStatusNot: String
      $roleName: String
      $limit: Int
      $offset: Int
    ) {
      users(
        searchField: $searchField
        membershipStatusNot: $membershipStatusNot
        roleName: $roleName
        limit: $limit
        offset: $offset
      ) {
        id
        firstName
        lastName
        title
        bio
        avatar
        membershipStatus
        role {
          id
          name
        }
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

export const USER_ROLE_QUERIES = {
  GET_USER_ROLE: gql`
    query userRole($id: ID!) {
      userRole(id: $id) {
        id
        name
        description
        permissions
      }
    }
  `,
  GET_USER_ROLES: gql`
    query userRoles($searchField: String, $limit: Int, $offset: Int) {
      userRoles(searchField: $searchField, limit: $limit, offset: $offset) {
        id
        name
        description
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
    query institutions($searchField: String, $limit: Int, $offset: Int) {
      institutions(searchField: $searchField, limit: $limit, offset: $offset) {
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
        createdAt
      }
    }
  `,
  GET_GROUPS: gql`
    query groups($searchField: String, $limit: Int, $offset: Int) {
      groups(searchField: $searchField, limit: $limit, offset: $offset) {
        id
        name
        description
        createdAt
      }
    }
  `,
};

export const ANNOUNCEMENT_QUERIES = {
  GET_ANNOUNCEMENT: gql`
    query announcement($id: ID!) {
      announcement(id: $id) {
        id
        title
        author {
          id
          firstName
          lastName
        }
        message
        institution {
          id
        }
        groups {
          id
          name
        }
        createdAt
      }
    }
  `,
  GET_ANNOUNCEMENTS: gql`
    query announcements($searchField: String, $limit: Int, $offset: Int) {
      announcements(searchField: $searchField, limit: $limit, offset: $offset) {
        id
        title
        author {
          id
          firstName
          lastName
        }
        message
        createdAt
      }
    }
  `,
};

export const COURSE_QUERIES = {
  GET_COURSE: gql`
    query course($id: ID!) {
      course(id: $id) {
        id
        title
        instructor {
          id
          firstName
          lastName
        }
        description
        institutions {
          id
          name
        }
      }
    }
  `,
  GET_COURSES: gql`
    query courses($searchField: String, $limit: Int, $offset: Int) {
      courses(searchField: $searchField, limit: $limit, offset: $offset) {
        id
        title
        instructor {
          id
          firstName
          lastName
        }
        description
      }
    }
  `,
};

export const CHAPTER_QUERIES = {
  GET_CHAPTER: gql`
    query chapter($id: ID!) {
      chapter(id: $id) {
        id
        title
        instructions
        course {
          id
          title
        }
      }
    }
  `,
  GET_CHAPTERS: gql`
    query chapters($searchField: String, $limit: Int, $offset: Int) {
      chapters(searchField: $searchField, limit: $limit, offset: $offset) {
        id
        title
        instructions
        course {
          id
          title
        }
      }
    }
  `,
};

export const CHAT_QUERIES = {
  GET_CHAT: gql`
    query chat($id: ID!) {
      chat(id: $id) {
        id
        chatType
        individualMemberOne {
          id
          firstName
          lastName
          avatar
          lastActive
        }
        individualMemberTwo {
          id
          firstName
          lastName
          avatar
          lastActive
        }
        group {
          members {
            id
            firstName
            lastName
          }
        }
        createdAt
      }
    }
  `,
  GET_CHATS: gql`
    query chats($searchField: String, $limit: Int, $offset: Int) {
      chats(searchField: $searchField, limit: $limit, offset: $offset) {
        chats {
          id
          chatType
          individualMemberOne {
            id
            firstName
            lastName
            avatar
            lastActive
          }
          individualMemberTwo {
            id
            firstName
            lastName
            avatar
            lastActive
          }
        }
        groups {
          id
          name
          avatar
          members {
            id
          }
          chat {
            id
          }
        }
      }
    }
  `,
  GET_CHAT_MESSAGES: gql`
    query chatMessages(
      $chatId: ID
      $searchField: String
      $limit: Int!
      $offset: Int!
    ) {
      chatMessages(
        chatId: $chatId
        searchField: $searchField
        limit: $limit
        offset: $offset
      ) {
        id
        message
        chat {
          id
        }
        author {
          id
          firstName
          lastName
          avatar
        }
        createdAt
      }
    }
  `,
  CHAT_SEARCH: gql`
    query chatSearch($query: String!) {
      chatSearch(query: $query) {
        users {
          id
          firstName
          lastName
          avatar
          lastActive
        }
        groups {
          id
          name
          avatar
          chat {
            id
          }
        }
        chatMessages {
          id
          message
          createdAt
          chat {
            id
          }
        }
      }
    }
  `,
};
