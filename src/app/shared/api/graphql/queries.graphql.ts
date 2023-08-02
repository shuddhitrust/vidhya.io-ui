import { gql } from 'apollo-angular';

export const AUTH_QUERIES = {
  ME: gql`
    query me {
      me {
        username
        firstName
        lastName
        name
        avatar
        title
        bio
        email
        dob
        phone
        mobile
        address
        pincode
        state
        city
        country
        designation
        projectsClapped {
          id
        }
        institution {
          id
          name
          institutionType
          verified
          coordinator{
            id
            name
            email
            mobile
          }
        }
        role {
          name
          permissions
        }
        membershipStatus
        googleLogin
        manualLogin
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
  GET_EMAIL_OTP: gql`
    query emailOtp($email: String!) {
      emailOtp(email: $email) {
        id
        email
        otp
        verified
      }
    }
  `,
};

export const PUBLIC_QUERIES = {
  GET_USER_BY_USERNAME: gql`
    query userByUsername($username: String!) {
      userByUsername(username: $username) {
        id
        username
        name
        title
        bio
        avatar
        institution {
          code
          name
          institutionType
        }
        courses {
          course {
            title
          }
          percentage
          completed
          updatedAt
        }
      }
    }
  `,
  GET_PUBLIC_USERS: gql`
    query publicUsers(
      $searchField: String
      $membershipStatusNot: [String]
      $membershipStatusIs: [String]
      $roles: [String]
      $limit: Int
      $offset: Int
    ) {
      publicUsers(
        searchField: $searchField
        membershipStatusNot: $membershipStatusNot
        membershipStatusIs: $membershipStatusIs
        roles: $roles
        limit: $limit
        offset: $offset
      ) {
        records {
          id
          username
          name
          title
          bio
          avatar
          institution {
            id
            name
          }
          score
        }
        total
      }
    }
  `,
  GET_PUBLIC_INSTITUTION: gql`
    query publicInstitution($code: String!) {
      publicInstitution(code: $code) {
        id
        name
        code
        location
        city
        website
        phone
        logo
        bio
        learnerCount
        completed
        percentage
        score
      }
    }
  `,
  GET_PUBLIC_INSTITUTIONS: gql`
    query publicInstitutions($searchField: String, $limit: Int, $offset: Int) {
      publicInstitutions(
        searchField: $searchField
        limit: $limit
        offset: $offset
      ) {
        records {
          id
          name
          code
          location
          city
          website
          phone
          logo
          bio
          address
          pincode
          state
          dob
          country
          designations
          institutionType
          score
        }
        total
      }
    }
  `,
  GET_PUBLIC_NEWS_ITEM: gql`
    query publicAnnouncement($id: ID!) {
      publicAnnouncement(id: $id) {
        id
        title
        views
        image
        blurb
        message
        institution {
          id
        }
        author {
          id
          name
          username
        }
        createdAt
      }
    }
  `,
  GET_PUBLIC_NEWS: gql`
    query publicAnnouncements($searchField: String, $limit: Int, $offset: Int) {
      publicAnnouncements(
        searchField: $searchField
        limit: $limit
        offset: $offset
      ) {
        id
        title
        author {
          id
          name
        }
        image
        blurb
        message
        seen
        createdAt
      }
    }
  `,
  GET_PUBLIC_COURSE_ITEM: gql`
    query publicCourse($id: ID!) {
      publicCourse(id: $id) {
        id
        title
        video
        blurb
        description
        instructor {
          username
          name
        }
        mandatoryPrerequisites {
          id
          title
        }
        recommendedPrerequisites {
          id
          title
        }
        startDate
        endDate
        creditHours
        createdAt
        updatedAt
      }
    }
  `,
  GET_PUBLIC_COURSES: gql`
    query publicCourses($searchField: String, $limit: Int, $offset: Int) {
      publicCourses(searchField: $searchField, limit: $limit, offset: $offset) {
        records {
          id
          index
          title
          blurb
          instructor {
            id
            name
          }
        }
        total
      }
    }
  `,
};

export const DASHBOARD_MUTATIONS = {
  GET_UNREAD_COUNT: gql`
    query unreadCount {
      unreadCount {
        announcements
        assignments
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
        name
        avatar
        title
        bio
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
  `,

  GET_USERS: gql`
    query users(
      $searchField: String
      $membershipStatusNot: [String]
      $membershipStatusIs: [String]
      $roles: [String]
      $limit: Int
      $offset: Int
    ) {
      users(
        searchField: $searchField
        membershipStatusNot: $membershipStatusNot
        membershipStatusIs: $membershipStatusIs
        roles: $roles
        limit: $limit
        offset: $offset
      ) {
        records {
          id
          username
          firstName
          lastName
          name
          title
          bio
          email
          dateJoined
          designation
          avatar
          membershipStatus
          role {
            name
          }
          institution {
            id
            name
            coordinator{
              id
              name
            }
          }
        }
        total
      }
    }
  `,
  GET_COORDINATORS_BY_INSTITUTION: gql`
  query coordinatorOptions(
    $query:String
    $roles: [String]
    $limit: Int
    $offset: Int
  ) {
    coordinatorOptions(
      query:$query
      roles: $roles
      limit: $limit
      offset: $offset
    ) {
      records {
        id
        name
        role {
          name
        }
      }
      total
    }
  }
`,
  GET_USERS_OPTIONS: gql`
    query users(
      $searchField: String
      $membershipStatusNot: [String]
      $membershipStatusIs: [String]
      $roles: [String]
      $limit: Int
      $offset: Int
    ) {
      users(
        searchField: $searchField
        membershipStatusNot: $membershipStatusNot
        membershipStatusIs: $membershipStatusIs
        roles: $roles
        limit: $limit
        offset: $offset
      ) {
        records {
          id
          name
          role {
            name
          }
        }
      }
    }
  `,
};

export const USER_ROLE_QUERIES = {
  GET_USER_ROLE: gql`
    query userRole($roleName: String!) {
      userRole(roleName: $roleName) {
        name
        priority
        description
        permissions
        createdAt
      }
    }
  `,
  GET_USER_ROLES: gql`
    query userRoles($searchField: String, $limit: Int, $offset: Int) {
      userRoles(searchField: $searchField, limit: $limit, offset: $offset) {
        records {
          name
          priority
          description
          createdAt
        }
        total
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
        code
        location
        city
        website
        phone
        logo
        bio
        address
        pincode
        state
        dob
        country
        invitecode
        designations
        institutionType
        coordinator{
          id
          name
          email
          mobile
          institution{
            id
            name           
          }
        }
        verified
        public
        author{
          id
          name
        }
      }
    }
  `,
  GET_INSTITUTION_ADMIN: gql`
  query institutionAdmin($id: ID!) {
    institutionAdmin(id: $id) {
      id
      name
      code
      location
      city
      website
      phone
      logo
      bio
      address
      pincode
      state
      dob
      country
      invitecode
      designations
      institutionType
      coordinator{
        id
        name
        email
        mobile
        institution{
          id
          name           
        }
      }
      verified
      public
    }
  }
  `,
  SEARCH_INSTITUTIONS: gql`
    query searchInstitution($name: String!){
      searchInstitution(name:$name){
        records {
          id
          name
          institutionType
          coordinator{
            id
            name
          }
          verified
        }
        total
      }
    }
  `,
  GET_INSTITUTIONS: gql`
    query institutions($searchField: String, $limit: Int, $offset: Int) {
      institutions(searchField: $searchField, limit: $limit, offset: $offset) {
        records {
          id
          name
          code
          location
          city
          website
          phone
          logo
          bio
          address
          pincode
          state
          dob
          country
          invitecode
          designations
          institutionType
          author{
            id
          username
          firstName
          lastName
          name
          title
          bio
          email
          dateJoined
          designation
          avatar
          membershipStatus
          role {
            name
          }
          institution {
            id
            name
            coordinator{
              id
              name
            }
          }
          }
          verified
          public
          createdAt
        }
        total
      }
    }
  `,
  GET_FETCH_DESIGNATION_BY_INSTITUTION: gql`
  query fetchDesignationByInstitution($id: ID!) {
    fetchDesignationByInstitution(id: $id) {      
        designations      
    }
  }
  `
};

export const GROUP_QUERIES = {
  GET_GROUP: gql`
    query group($id: ID!) {
      group(id: $id) {
        id
        name
        avatar
        description
        institution {
          id
          name
          designations
          institutionType
        }
        groupType
        admins {
          id
          name
        }
        members {
          id
          name
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
        groupType
        institution {
          name
        }
        admins {
          name
        }
        adminCount
        memberCount
        description
        createdAt
      }
    }
  `,
  GET_ADMIN_GROUPS: gql`
    query adminGroups($searchField: String, $limit: Int, $offset: Int) {
      adminGroups(searchField: $searchField, limit: $limit, offset: $offset) {
        id
        name
        groupType
        description
        createdAt
      }
    }
  `,
  GET_ADMIN_GROUP_OPTIONS: gql`
    query adminGroups($searchField: String, $limit: Int, $offset: Int) {
      adminGroups(searchField: $searchField, limit: $limit, offset: $offset) {
        id
        name
        groupType
      }
    }
  `,
};

export const ANNOUNCEMENT_QUERIES = {
  GET_ANNOUNCEMENT_PROFILE: gql`
    query announcement($id: ID!) {
      announcement(id: $id) {
        id
        title
        views
        image
        blurb
        message
        institution {
          id
        }
        author {
          id
          name
          username
        }
        createdAt
      }
    }
  `,
  GET_ANNOUNCEMENT_FORM_DETAILS: gql`
    query announcement($id: ID!) {
      announcement(id: $id) {
        id
        title
        author {
          id
          name
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
          name
        }
        image
        blurb
        message
        seen
        createdAt
      }
    }
  `,
};

export const PROJECT_QUERIES = {
  GET_PROJECT_PROFILE: gql`
    query project($id: ID!) {
      project(id: $id) {
        id
        title
        author {
          id
          name
          username
          institution {
            name
            location
          }
        }
        course {
          id
          title
        }
        link
        public
        description
        claps
        createdAt
      }
    }
  `,
  GET_PROJECT_FORM_DETAILS: gql`
    query project($id: ID!) {
      project(id: $id) {
        id
        title
        author {
          id
          name
        }
        course {
          id
          title
        }
        link
        public
        description
        claps
        createdAt
      }
    }
  `,
  GET_PROJECTS: gql`
    query projects(
      $searchField: String
      $authorId: ID
      $sortBy: String
      $limit: Int
      $offset: Int
    ) {
      projects(
        searchField: $searchField
        sortBy: $sortBy
        authorId: $authorId
        limit: $limit
        offset: $offset
      ) {
        id
        title
        author {
          id
          name
          institution {
            name
            location
          }
        }
        link
        description
        claps
        createdAt
      }
    }
  `,
};

export const ISSUE_QUERIES = {
  GET_ISSUE_PROFILE: gql`
    query issue($id: ID!) {
      issue(id: $id) {
        id
        title
        subtitle
        link
        description
        resourceId
        resourceType
        reporter {
          id
          username
          name
        }
        resolver {
          id
          username
          name
        }
        guestName
        guestEmail
        screenshot
        status
        remarks
        createdAt
      }
    }
  `,
  GET_ISSUE_FORM_DETAILS: gql`
    query issue($id: ID!) {
      issue(id: $id) {
        id
        link
        description
        resourceId
        resourceType
        reporter {
          id
          name
        }
        guestName
        guestEmail
        screenshot
        status
        remarks
        createdAt
      }
    }
  `,
  GET_ISSUES: gql`
    query issues(
      $searchField: String
      $reporterId: ID
      $status: String
      $resourceType: String
      $link: String
      $limit: Int
      $offset: Int
    ) {
      issues(
        searchField: $searchField
        reporterId: $reporterId
        status: $status
        resourceType: $resourceType
        link: $link
        limit: $limit
        offset: $offset
      ) {
        id
        title
        subtitle
        link
        resourceType
        reporter {
          id
          name
        }
        guestName
        status
        description
        createdAt
      }
    }
  `,
};

export const COURSE_QUERIES = {
  GET_COURSE_PROFILE: gql`
    query course($id: ID!) {
      course(id: $id) {
        id
        index
        title
        blurb
        description
        video
        instructor {
          id
          name
        }
        startDate
        endDate
        creditHours
        status
        passScorePercentage
        passCompletionPercentage
        locked
        completed
      }
    }
  `,
  GET_COURSE_FORM_DETAILS: gql`
    query course($id: ID!) {
      course(id: $id) {
        id
        index
        title
        blurb
        description
        video
        instructor {
          id
          name
        }
        startDate
        endDate
        creditHours
        status
        passScorePercentage
        passCompletionPercentage
        locked
        completed
        graders {
          id
          name
        }
        participants {
          id
          name
        }
        mandatoryPrerequisites {
          id
          title
        }
      }
    }
  `,
  GET_COURSES: gql`
    query courses($searchField: String, $limit: Int, $offset: Int) {
      courses(searchField: $searchField, limit: $limit, offset: $offset) {
        id
        index
        title
        blurb
        instructor {
          id
          name
        }
        description
        status
        locked
        completed
        mandatoryPrerequisites {
          id
          title
        }
      }
    }
  `,
};

export const COURSE_SECTION_QUERIES = {
  GET_COURSE_SECTION: gql`
    query courseSection($id: ID!) {
      courseSection(id: $id) {
        id
        title
        index
        course {
          id
          title
        }
      }
    }
  `,
  GET_COURSE_SECTIONS: gql`
    query courseSections(
      $courseId: ID!
      $searchField: String
      $limit: Int
      $offset: Int
    ) {
      courseSections(
        courseId: $courseId
        searchField: $searchField
        limit: $limit
        offset: $offset
      ) {
        id
        title
        index
        course {
          id
          title
        }
      }
    }
  `,
};

export const CHAPTER_QUERIES = {
  GET_CHAPTER_PROFILE: gql`
    query chapter($id: ID!) {
      chapter(id: $id) {
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
        locked
        completed
      }
    }
  `,
  GET_CHAPTER_FORM_DETAILS: gql`
    query chapter($id: ID!) {
      chapter(id: $id) {
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
        locked
        completed
        prerequisites {
          id
          title
        }
      }
    }
  `,
  GET_CHAPTERS: gql`
    query chapters(
      $courseId: ID
      $searchField: String
      $limit: Int
      $offset: Int
    ) {
      chapters(
        courseId: $courseId
        searchField: $searchField
        limit: $limit
        offset: $offset
      ) {
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
        completionStatus
        completed
        locked
      }
    }
  `,
};

export const EXERCISE_QUERIES = {
  GET_EXERCISE: gql`
    query exercise($id: ID!) {
      exercise(id: $id) {
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
        rubric {
          id
          description
          points
          active
        }
      }
    }
  `,
  GET_EXERCISES: gql`
    query exercises(
      $chapterId: ID!
      $searchField: String
      $limit: Int
      $offset: Int
    ) {
      exercises(
        chapterId: $chapterId
        searchField: $searchField
        limit: $limit
        offset: $offset
      ) {
        exercises {
          id
          prompt
          index
          chapter {
            id
            title
            course {
              id
            }
          }
          questionType
          required
          options
          points
          rubric {
            id
            description
            points
            active
          }
        }
        submissions {
          id
          participant {
            id
          }
          exercise {
            id
            chapter {
              id
            }
            course {
              id
            }
          }
          option
          answer
          link
          images
          points
          rubric {
            id
            score
            remarks
            participant {
              id
            }
            remarker {
              id
              name
            }
            criterion {
              id
              description
              points
              active
            }
          }
          status
          remarks
          flagged
          grader {
            name
          }
          createdAt
          updatedAt
        }
      }
    }
  `,
};

export const EXERCISE_SUBMISSION_QUERIES = {
  GET_EXERCISE_SUBMISSION: gql`
    query exerciseSubmission($id: ID!) {
      exerciseSubmission(id: $id) {
        id
        participant {
          id
          name
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
        link
        images
        points
        percentage
        status
        remarks
        flagged
        grader {
          name
        }
        createdAt
        updatedAt
      }
    }
  `,
  GET_EXERCISE_SUBMISSIONS: gql`
    query exerciseSubmissions(
      $submissionId: ID
      $exerciseId: ID
      $participantId: ID
      $chapterId: ID
      $courseId: ID
      $status: String
      $flagged: Boolean
      $searchField: String
      $limit: Int
      $offset: Int
    ) {
      exerciseSubmissions(
        submissionId: $submissionId
        exerciseId: $exerciseId
        participantId: $participantId
        chapterId: $chapterId
        courseId: $courseId
        status: $status
        flagged: $flagged
        searchField: $searchField
        limit: $limit
        offset: $offset
      ) {
        id
        participant {
          id
          name
          institution {
            id
            name
          }
        }
        exercise {
          id
          index
          questionType
          prompt
          options
          points
          rubric {
            id
            description
            points
            active
          }
          course {
            id
            title
          }
          chapter {
            id
            title
            index
            dueDate
            section {
              index
              title
            }
          }
        }
        option
        answer
        link
        images
        rubric {
          id
          score
          remarks
          participant {
            id
          }
          remarker {
            id
            name
          }
          criterion {
            id
            description
            points
            active
          }
        }
        points
        percentage
        status
        remarks
        flagged
        grader {
          name
        }
        createdAt
        updatedAt
      }
    }
  `,
  GET_SUBMISSION_HISTORY: gql`
    query submissionHistory($exerciseId: ID, $participantId: ID) {
      submissionHistory(
        exerciseId: $exerciseId
        participantId: $participantId
      ) {
        id
        participant {
          id
          name
          institution {
            id
            name
          }
        }
        exercise {
          id
          index
          questionType
          prompt
          options
          points
          course {
            id
            title
          }
          chapter {
            id
            title
            index
            dueDate
            section {
              index
              title
            }
          }
        }
        option
        answer
        link
        images
        status
        points
        rubric
        remarks
        flagged
        grader {
          name
        }
        createdAt
        updatedAt
      }
    }
  `,
  GET_EXERCISE_SUBMISSION_GROUPS: gql`
    query exerciseSubmissionGroups(
      $groupBy: String!
      $status: String!
      $flagged: Boolean
      $searchField: String
      $limit: Int
      $offset: Int
    ) {
      exerciseSubmissionGroups(
        groupBy: $groupBy
        status: $status
        flagged: $flagged
        searchField: $searchField
        limit: $limit
        offset: $offset
      ) {
        id
        type
        title
        subtitle
        count
      }
    }
  `,
};

export const ASSIGNMENT_QUERIES = {
  GET_ASSIGNMENTS: gql`
    query assignments($status: String, $limit: Int, $offset: Int) {
      assignments(status: $status, limit: $limit, offset: $offset) {
        id
        title
        course
        section
        status
        dueDate
        exerciseCount
        submittedCount
        gradedCount
        pointsScored
        percentage
        totalPoints
      }
    }
  `,
};

export const EXERCISE_KEY_QUERIES = {
  GET_EXERCISE_KEY: gql`
    query exerciseKey($exerciseId: ID!) {
      exerciseKey(exerciseId: $exerciseId) {
        id
        exercise {
          id
          prompt
          questionType
          required
          course {
            id
          }
          chapter {
            id
          }
          options
          points
          rubric {
            id
            description
            points
            active
          }
        }
        validOption
        validAnswers
        referenceLink
        referenceImages
        remarks
      }
    }
  `,
  GET_EXERCISE_KEYS: gql`
    query exerciseKeys(
      $exerciseId: ID
      $chapterId: ID
      $courseId: ID
      $searchField: String
      $limit: Int
      $offset: Int
    ) {
      exerciseKeys(
        exerciseId: $exerciseId
        chapterId: $chapterId
        courseId: $courseId
        searchField: $searchField
        limit: $limit
        offset: $offset
      ) {
        id
        exercise {
          id
          prompt
          index
          questionType
          required
          chapter {
            id
          }
          options
          points
          rubric {
            id
            description
            points
            active
          }
        }
        validOption
        validAnswers
        referenceLink
        referenceImages
        remarks
      }
    }
  `,
};

export const REPORT_QUERIES = {
  GET_REPORT: gql`
    query report($id: ID!) {
      report(id: $id) {
        id
        participant {
          id
          name
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
    }
  `,
  GET_REPORTS: gql`
    query reports(
      $participantId: ID
      $courseId: ID
      $institutionId: ID
      $searchField: String
      $limit: Int
      $offset: Int
    ) {
      reports(
        participantId: $participantId
        courseId: $courseId
        institutionId: $institutionId
        searchField: $searchField
        limit: $limit
        offset: $offset
      ) {
        records {
          id
          participant {
            id
            name
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
        total
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
        group {
          members {
            id
            name
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
          name
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
          name
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
