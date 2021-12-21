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

  after(() => {
    cy.deleteCreatedGlobalAnnouncement();
  });
});
