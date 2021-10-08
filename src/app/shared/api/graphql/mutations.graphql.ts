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
          name
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
  DELETE_USER: gql`
    mutation deleteUser($id: ID!) {
      deleteUser(id: $id) {
        ok
        user {
          id
          name
        }
      }
    }
  `,
  APPROVE_USER: gql`
    mutation approveUser($userId: ID!, $roleName: String!) {
      approveUser(userId: $userId, roleName: $roleName) {
        ok
        user {
          id
          membershipStatus
        }
      }
    }
  `,
  SUSPEND_USER: gql`
    mutation deleteUser($userId: ID!, $remarks: String!) {
      suspendUser(userId: $userId, remarks: $remarks) {
        ok
        user {
          id
          membershipStatus
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
          name
          priority
          description
          createdAt
        }
      }
    }
  `,
  UPDATE_USER_ROLE: gql`
    mutation updateUserRole($roleName: String!, $input: UserRoleInput!) {
      updateUserRole(roleName: $roleName, input: $input) {
        ok
        userRole {
          name
          priority
          description
          createdAt
        }
      }
    }
  `,
  DELETE_USER_ROLE: gql`
    mutation deleteUserRole($roleName: String!) {
      deleteUserRole(roleName: $roleName) {
        ok
        userRole {
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
          location
          city
          bio
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
          location
          city
          bio
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
          description
          createdAt
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
          description
          createdAt
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
          author {
            id
            name
          }
          message
          createdAt
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
          author {
            id
            name
          }
          message
          createdAt
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
          blurb
          instructor {
            id
            name
          }
          description
          status
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
          blurb
          instructor {
            id
            name
          }
          description
          status
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
  PUBLISH_COURSE: gql`
    mutation publishCourse($id: ID!, $publishChapters: Boolean!) {
      publishCourse(id: $id, publishChapters: $publishChapters) {
        ok
        course {
          id
          title
          status
        }
      }
    }
  `,
};

export const COURSE_SECTION_MUTATIONS = {
  CREATE_COURSE_SECTION: gql`
    mutation createCourseSection($input: CourseSectionInput!) {
      createCourseSection(input: $input) {
        ok
        courseSection {
          id
          title
          index
          course {
            id
            title
          }
        }
      }
    }
  `,
  UPDATE_COURSE_SECTION: gql`
    mutation updateCourseSection($id: ID!, $input: CourseSectionInput!) {
      updateCourseSection(id: $id, input: $input) {
        ok
        courseSection {
          id
          title
          index
          course {
            id
            title
          }
        }
      }
    }
  `,
  DELETE_COURSE_SECTION: gql`
    mutation deleteCourseSection($id: ID!) {
      deleteCourseSection(id: $id) {
        ok
        courseSection {
          id
          title
        }
      }
    }
  `,
  REORDER_COURSE_SECTIONS: gql`
    mutation reorderCourseSections($indexList: [IndexListInputType]!) {
      reorderCourseSections(indexList: $indexList) {
        ok
      }
    }
  `,
};

export const CHAPTER_MUTATIONS = {
  CREATE_CHAPTER: gql`
    mutation createChapter($input: ChapterInput!) {
      createChapter(input: $input) {
        ok
        chapter {
          id
          title
          index
          instructions
          course {
            id
            title
            status
          }
          section {
            id
            title
            index
          }
          dueDate
          points
          status
        }
      }
    }
  `,
  UPDATE_CHAPTER: gql`
    mutation updateChapter($id: ID!, $input: ChapterInput!) {
      updateChapter(id: $id, input: $input) {
        ok
        chapter {
          id
          title
          index
          instructions
          course {
            id
            title
            status
          }
          section {
            id
            title
            index
          }
          dueDate
          points
          status
        }
      }
    }
  `,
  DELETE_CHAPTER: gql`
    mutation deleteChapter($id: ID!) {
      deleteChapter(id: $id) {
        ok
        chapter {
          id
          title
          course {
            id
          }
        }
      }
    }
  `,
  PUBLISH_CHAPTER: gql`
    mutation publishChapter($id: ID!) {
      publishChapter(id: $id) {
        ok
        chapter {
          id
          title
          status
        }
      }
    }
  `,
  REORDER_CHAPTERS: gql`
    mutation reorderChapters($indexList: [IndexListInputType]!) {
      reorderChapters(indexList: $indexList) {
        ok
      }
    }
  `,
};

export const EXERCISE_MUTATIONS = {
  CREATE_EXERCISE: gql`
    mutation createExercise($input: ExerciseInput!) {
      createExercise(input: $input) {
        ok
        exercise {
          id
          prompt
          chapter {
            id
            title
          }
          questionType
          required
          options
          points
          rubric
        }
      }
    }
  `,
  UPDATE_EXERCISE: gql`
    mutation updateExercise($id: ID!, $input: ExerciseInput!) {
      updateExercise(id: $id, input: $input) {
        ok
        exercise {
          id
          prompt
          chapter {
            id
            title
          }
          questionType
          required
          options
          points
          rubric
        }
      }
    }
  `,
  DELETE_EXERCISE: gql`
    mutation deleteExercise($id: ID!) {
      deleteExercise(id: $id) {
        ok
        exercise {
          id
          prompt
        }
      }
    }
  `,
  REORDER_EXERCISES: gql`
    mutation reorderExercises($indexList: [IndexListInputType]!) {
      reorderExercises(indexList: $indexList) {
        ok
      }
    }
  `,
};

export const EXERCISE_SUBMISSION_MUTATIONS = {
  CREATE_UPDATE_EXERCISE_SUBMISSIONS: gql`
    mutation createUpdateExerciseSubmissions(
      $exerciseSubmissions: [ExerciseSubmissionInput]!
      $grading: Boolean!
      $bulkauto: Boolean
    ) {
      createUpdateExerciseSubmissions(
        exerciseSubmissions: $exerciseSubmissions
        grading: $grading
        bulkauto: $bulkauto
      ) {
        ok
        exerciseSubmissions {
          id
          status
          points
          percentage
          remarks
          criteriaSatisfied
        }
      }
    }
  `,
  UPDATE_EXERCISE_SUBMISSION: gql`
    mutation updateExerciseSubmission(
      $id: ID!
      $input: ExerciseSubmissionInput!
    ) {
      updateExerciseSubmission(id: $id, input: $input) {
        ok
        exerciseSubmission {
          id
          status
          points
          percentage
          criteriaSatisfied
          remarks
        }
      }
    }
  `,
  DELETE_EXERCISE_SUBMISSION: gql`
    mutation deleteExerciseSubmission($id: ID!) {
      deleteExerciseSubmission(id: $id) {
        ok
        exerciseSubmission {
          id
          title
        }
      }
    }
  `,
};

export const REPORT_MUTATIONS = {
  CREATE_REPORT: gql`
    mutation createReport($input: ReportInput!) {
      createReport(input: $input) {
        ok
        report {
          id
        }
      }
    }
  `,
  UPDATE_REPORT: gql`
    mutation updateReport($id: ID!, $input: ReportInput!) {
      updateReport(id: $id, input: $input) {
        ok
        report {
          id
        }
      }
    }
  `,
  DELETE_REPORT: gql`
    mutation deleteReport($id: ID!) {
      deleteReport(id: $id) {
        ok
        report {
          id
        }
      }
    }
  `,
};

export const CHAT_MUTATIONS = {
  CHAT_SEARCH: gql`
    mutation chatSearch($query: String!) {
      chatSearch(query: $query) {
        ok
        users {
          id
          name
          avatar
          lastActive
        }
        groups {
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
  DELETE_CHAT: gql`
    mutation deleteChat($id: ID!) {
      deleteChat(id: $id) {
        ok
        chat {
          id
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
          chatType
          individualMemberOne {
            id
            name
            avatar
            lastActive
          }
          individualMemberTwo {
            id
            name
            avatar
            lastActive
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
            group {
              name
              members {
                id
                name
              }
            }
            chatmessageSet {
              id
              message
              author {
                id
                name
                avatar
              }
              createdAt
              seenBy {
                id
                name
              }
              createdAt
              seenBy {
                name
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
            name
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
            name
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
          name
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
