import { gql } from 'apollo-angular';

export const SUBSCRIPTIONS = {
  institution: gql`
    subscription institution {
      notifyInstitution {
        institution {
          id
          name
          location
          city
          bio
        }
        method
      }
    }
  `,
  user: gql`
    subscription user {
      notifyUser {
        user {
          id
          firstName
          lastName
          title
          bio
          membershipStatus
          institution {
            id
            name
          }
        }
        method
      }
    }
  `,
  userRole: gql`
    subscription userrole {
      notifyUserRole {
        userRole {
          id
          name
          description
          permissions
        }
        method
      }
    }
  `,
  announcement: gql`
    subscription announcement {
      notifyAnnouncement {
        announcement {
          id
          title
          author
          message
          seenBy
        }
        method
      }
    }
  `,
  group: gql`
    subscription group {
      notifyGroup {
        group {
          id
          name
          description
        }
        method
      }
    }
  `,
  course: gql`
    subscription course {
      notifyCourse {
        course {
          id
          title
          description
        }
        method
      }
    }
  `,
  assignment: gql`
    subscription assignment {
      notifyAssignment {
        assignment {
          id
          title
          instructions
        }
        method
      }
    }
  `,
  chat: gql`
    subscription chat {
      notifyChat {
        chat {
          id
          name
          members {
            id
            firstName
            lastName
            avatar
          }
        }
        method
      }
    }
  `,
  chatMessage: gql`
    subscription chatMessage {
      notifyChatMessage {
        chatMessage {
          id
          chat {
            id
          }
          message
          author {
            id
            firstName
            lastName
            avatar
          }
          seenBy {
            id
          }
        }
        method
      }
    }
  `,
};
