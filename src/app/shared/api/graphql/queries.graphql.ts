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
    query users($searchField: String, $limit: Int, $offset: Int) {
      users(searchField: $searchField, limit: $limit, offset: $offset) {
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
      }
    }
  `,
  GET_GROUPS: gql`
    query groups($searchField: String, $limit: Int, $offset: Int) {
      groups(searchField: $searchField, limit: $limit, offset: $offset) {
        id
        name
        description
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

export const ASSIGNMENT_QUERIES = {
  GET_ASSIGNMENT: gql`
    query assignment($id: ID!) {
      assignment(id: $id) {
        id
        title
        description
        course {
          id
          title
        }
      }
    }
  `,
  GET_ASSIGNMENTS: gql`
    query assignments($searchField: String, $limit: Int, $offset: Int) {
      assignments(searchField: $searchField, limit: $limit, offset: $offset) {
        id
        title
        description
        course {
          id
          title
        }
      }
    }
  `,
};
