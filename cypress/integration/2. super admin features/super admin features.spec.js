/// <reference types="cypress" />

describe("Super Admin User Features", () => {
  before(() => {
    cy.loginSuperAdmin();
  });
  beforeEach(() => {
    cy.fixture("routes").as("routes");
  });

  it("All necessary tabs are visible", () => {
    cy.get("@routes").then((routes) => {
      cy.visit(routes.DASHBOARD_ROUTE.route);
      cy.get("[data-cy=dashboard-tabs]").should("be.visible");
      cy.get(".ant-tabs-nav-wrap").contains("Admin");
      cy.get(".ant-tabs-nav-wrap").contains("Announcements");
      cy.get(".ant-tabs-nav-wrap").contains("Assignments");
      cy.get(".ant-tabs-nav-wrap").contains("Courses");
      cy.get(".ant-tabs-nav-wrap").contains("Groups");
      cy.get(".ant-tabs-nav-wrap").contains("Grading");
      cy.get(".ant-tabs-nav-wrap").contains("Reports");
    });
  });

  it("All necessary sections are visible within Admin tab", () => {
    cy.get("@routes").then((routes) => {
      cy.visit(routes.DASHBOARD_ROUTE.route);
      cy.get("[data-cy=dashboard-tabs]").should("be.visible");
      cy.get(".mat-selection-list").contains("Issues");
      cy.get(".mat-selection-list").contains("Moderation");
      cy.get(".mat-selection-list").contains("User Roles");
      cy.get(".mat-selection-list").contains("Institutions");
      cy.get(".mat-selection-list").contains("Members");
      cy.get(".mat-selection-list").contains("Institution Admins");
      cy.get(".mat-selection-list").contains("Class Admins");
      cy.get(".mat-selection-list").contains("Learners");
    });
  });

  it("All necessary features exist in Announcements tab", () => {
    cy.get("@routes").then((routes) => {
      cy.visit(routes.DASHBOARD_ROUTE.route + "?tab=Announcements");
      cy.get("[data-cy=mark-all-as-seen-button]").should("be.visible");
      cy.get("[data-cy=add-announcement-button]").should("be.visible");
      cy.get("[data-cy=add-announcement-button]").click();
      cy.get("[data-cy=form-title]").contains("Announcement Form");
    });
  });

  it("All necessary features exist in Courses tab", () => {
    cy.get("@routes").then((routes) => {
      cy.visit(routes.DASHBOARD_ROUTE.route + "?tab=Courses");
      cy.get("[data-cy=add-course-button]").should("be.visible");
      cy.get("[data-cy=add-course-button]").click();
      cy.get("[data-cy=form-title]").contains("Course Form");
    });
  });

  it("All necessary features exist in Groups tab", () => {
    cy.get("@routes").then((routes) => {
      cy.visit(routes.DASHBOARD_ROUTE.route + "?tab=Groups");
      cy.get("[data-cy=add-group-button]").should("be.visible");
      cy.get("[data-cy=add-group-button]").click();
      cy.get("[data-cy=form-title]").contains("Group Form");
    });
  });

  it("All necessary features exist in Grading tab", () => {
    cy.get("@routes").then((routes) => {
      cy.visit(routes.DASHBOARD_ROUTE.route + "?tab=Grading");
      cy.get("[data-cy=search-query-input]").should("be.visible");
      cy.get("[data-cy=search-filter-menu-button]").should("be.visible");
    });
  });

  it("All necessary features exist in Reports tab", () => {
    cy.get("@routes").then((routes) => {
      cy.visit(routes.DASHBOARD_ROUTE.route + "?tab=Reports");
      cy.get("[data-cy=reports-table]").should("be.visible");
    });
  });
});
