/// <reference types="cypress" />

describe("Learner Features: Dashboard", () => {
  before(() => {
    cy.loginLearner();
  });
  beforeEach(() => {
    cy.fixture("routes").as("routes");
  });

  it("Only permitted tabs are visible", () => {
    cy.get("@routes").then((routes) => {
      cy.visit(routes.DASHBOARD_ROUTE.route);
      cy.get("[data-cy=dashboard-tabs]").should("be.visible");
      cy.get(".ant-tabs-nav-wrap").contains("Admin").should("not.exist");
      cy.get(".ant-tabs-nav-wrap").contains("Announcements");
      cy.get(".ant-tabs-nav-wrap").contains("Assignments");
      cy.get(".ant-tabs-nav-wrap").contains("Courses");
      cy.get(".ant-tabs-nav-wrap").contains("Groups");
      cy.get(".ant-tabs-nav-wrap").contains("Grading").should("not.exist");
      cy.get(".ant-tabs-nav-wrap").contains("Reports").should("not.exist");
    });
  });
});
describe("Learner Features: Announcements", () => {
  before(() => {
    cy.loginLearner();
    cy.createGlobalAnnouncement();
  });
  beforeEach(() => {
    cy.fixture("routes").as("routes");
  });
  it("All necessary features exist in Announcements tab", () => {
    cy.get("@routes").then((routes) => {
      cy.visit(routes.DASHBOARD_ROUTE.route + "?tab=Announcements");
      cy.get("[data-cy=mark-all-as-seen-button]").should("be.visible");
      cy.get("[data-cy=add-announcement-button]").should("not.exist");
      cy.get('[data-cy="announcement-cards"] > :nth-child(1)').click();
      cy.get('[data-cy="announcement-title"]').should("exist");
      cy.fixture("existing-records").then((existing) => {
        cy.get('[data-cy="announcement-title"]').contains(
          existing.newAnnouncement.title
        );
      });
    });
  });

  after(() => {
    cy.deleteCreatedGlobalAnnouncement();
  });
});

describe("Learner Features: Courses", () => {
  before(() => {
    cy.loginLearner();
    cy.addLearnerToCourse();
  });
  beforeEach(() => {
    cy.fixture("routes").as("routes");
  });
  it("All necessary features exist in Courses tab", () => {
    cy.get("@routes").then((routes) => {
      cy.visit(routes.DASHBOARD_ROUTE.route + "?tab=Courses");
      cy.get('[data-cy="course-cards"] > :nth-child(1)').click();
      cy.get('[data-cy="course-title"]').should("exist");
      // cy.fixture("existing-records").then((existing) => {
      //   cy.get('[data-cy="course-title"]').contains(existing.course.title);
      // });
    });
  });

  it("All necessary features exist in Chapter profile page", () => {
    cy.get("@routes").then((routes) => {
      cy.fixture("existing-records").then((existing) => {
        cy.visit(
          routes.COURSE_PROFILE_ROUTE.route + "?id=" + existing.course.id
        );
        cy.get(":nth-child(1) > :nth-child(2) > .mat-card").click();
        cy.get('[data-cy="chapter-title"]').should("exist");
      });
    });
  });
});

describe("Learner Features: Exercise Submissions work", () => {
  before(() => {
    cy.loginLearner();
    cy.addLearnerToCourse();
    cy.clearLearnerExerciseSubmissions();
  });
  beforeEach(() => {
    cy.fixture("routes").as("routes");
  });
  it("All necessary features exist in Course profile page", () => {
    cy.get("@routes").then((routes) => {
      cy.fixture("existing-records").then((existing) => {
        cy.visit(
          routes.COURSE_PROFILE_ROUTE.route + "?id=" + existing.course.id
        );
        cy.get(":nth-child(1) > :nth-child(2) > .mat-card").click();
        cy.get("[data-cy=option]").click({ multiple: true });
        // if (cy.get("[data-cy=answer]").exists()) {
        //   cy.get("[data-cy=answer]").then((els) => {
        //     [...els].forEach((el) => cy.wrap(el).type("Test answer"));
        //   });
        // }

        // cy.get("[data-cy=link]").then((els) => {
        //   [...els].forEach((el) => cy.wrap(el).type("http://test.link"));
        // });
        cy.get("[data-cy=submit-exercises]").click();
        cy.get(".hot-toast-message").contains("success");
      });
    });
  });
});

describe("Learner Features: Groups", () => {
  before(() => {
    cy.loginLearner();
    cy.createLearnerGroup();
  });
  beforeEach(() => {
    cy.fixture("routes").as("routes");
  });
  it("All necessary features exist in Groups tab", () => {
    cy.get("@routes").then((routes) => {
      cy.visit(routes.DASHBOARD_ROUTE.route + "?tab=Groups");
      cy.get("[data-cy=add-group-button]").should("not.exist");
      cy.get('[data-cy="group-cards"] > :nth-child(1)').click();
      cy.get('[data-cy="group-name"]').should("exist");
      cy.fixture("existing-records").then((existing) => {
        cy.get('[data-cy="group-name"]').contains(existing.newGroup.name);
      });
    });
  });

  after(() => {
    cy.deleteCreatedLearnerGroup();
  });
});
