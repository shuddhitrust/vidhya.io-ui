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
          name
          title
          bio
          avatar
          membershipStatus
          role {
            name
          }
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
          name
          priority
          description
          permissions
          createdAt
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
          author {
            id
            name
            avatar
          }
          message
          seenBy {
            id
            firstName
            lastName
          }
          createdAt
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
          createdAt
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
          blurb
          instructor {
            id
            name
          }
          description
          status
        }
        method
      }
    }
  `,
  courseSection: gql`
    subscription courseSection {
      notifyCourseSection {
        courseSection {
          id
          index
          title
          index
          course {
            id
            title
          }
        }
        method
      }
    }
  `,
  chapter: gql`
    subscription chapter {
      notifyChapter {
        chapter {
          id
          title
          index
          instructions
          course {
            id
            title
          }
          section {
            id
            title
            index
          }
          dueDate
          points
        }
        method
      }
    }
  `,
  exercise: gql`
    subscription exercise {
      notifyExercise {
        exercise {
          id
          prompt
          index
          questionType
          required
          options
          points
        }
        method
      }
    }
  `,
  exerciseFileAttachment: gql`
    subscription exerciseFileAttachment {
      notifyExerciseFileAttachment {
        exerciseFileAttachment {
          id
          name
          exercise {
            id
          }
          description
        }
        method
      }
    }
  `,
  exerciseSubmission: gql`
    subscription exerciseSubmission {
      notifyExerciseSubmission {
        exerciseSubmission {
          id
          participant {
            id
            firstName
            lastName
            institution {
              id
              name
            }
          }
          exercise {
            id
          }
          option
          answer
          points
          status
        }
        method
      }
    }
  `,
  exerciseKey: gql`
    subscription exerciseKey {
      notifyExerciseKey {
        exerciseKey {
          id
          exercise {
            id
            prompt
            chapter {
              id
            }
            options
            points
          }
          validOption
          validAnswers
          referenceLink
          referenceImages
          remarks
        }
        method
      }
    }
  `,
  report: gql`
    subscription report {
      notifyReport {
        report {
          id
          participant {
            id
            firstName
            lastName
          }
          course {
            id
            title
          }
          institution {
            id
            name
          }
          completed
          percentage
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
          individualMemberOne {
            id
            firstName
            lastName
          }
          individualMemberTwo {
            id
            firstName
            lastName
          }
          group {
            name
            members {
              id
              firstName
              lastName
              avatar
            }
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
          createdAt
        }
        method
      }
    }
  `,
};
