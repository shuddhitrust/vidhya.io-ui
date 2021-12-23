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

// describe("Auth Module: Registration Feature", () => {
//   before(() => {
//     cy.deleteNewUser();
//   });
//   beforeEach(() => {
//     cy.logout();
//     cy.fixture("routes").as("routes");
//     cy.get("@routes").then((routes) => {
//       cy.visit(routes.HOME_ROUTE.route);
//       cy.get("[data-cy=login-button]").click();
//       cy.get("[data-cy=registration-link]").contains("Register").click();
//     });
//   });

//   it("Registration dialog box works", () => {
//     cy.get("[data-cy=invitecode-dialog-box]").should("be.visible");
//     cy.get("[data-cy=dialog-box-title]").contains("Enter Invite Code");
//     cy.get("[data-cy=go-to-login-dialog-box]").should("be.visible");
//   });

//   it("New user is able to register successfully", () => {
//     cy.fixture("existing-records").then((existing) => {
//       cy.get("[data-cy=invitecode-field]").type(
//         existing.institution.invitecode
//       );
//       cy.get("[data-cy=verify-invitation").click();
//       cy.get("[data-cy=registration-dialog-box]").should("be.visible");
//       cy.get("[data-cy=dialog-box-title]").contains("Register");
//       cy.get("[data-cy=registration-username-field]").type(
//         existing.newUser.username
//       );
//       cy.get("[data-cy=registration-email-field]").type(existing.newUser.email);
//       cy.get("[data-cy=registration-password-field]").type(
//         existing.newUser.password
//       );
//       cy.get("[data-cy=registration-password-confirmation-field]").type(
//         existing.newUser.password
//       );
//       cy.get(".mat-checkbox-inner-container > input").check({ force: true });
//       cy.get("[data-cy=go-to-login-dialog-box]").should("be.visible");
//       cy.get("[data-cy=register-submit-button]").click();
//       cy.get("[data-cy=registration-dialog-box]").should("not.be.visible");
//       cy.get(".hot-toast-message").contains(
//         "Registered successfully! Check your email inbox to fully activate your account."
//       );
//     });
//   });
//   after(() => {
//     cy.deleteNewUser();
//     cy.logout();
//   });
// });

// describe("Auth Module: Help with login issues", () => {
//   beforeEach(() => {
//     cy.logout();
//     cy.fixture("routes").as("routes");
//     cy.get("@routes").then((routes) => {
//       cy.visit(routes.HOME_ROUTE.route);
//       cy.get("[data-cy=login-button]").click();
//       cy.get("[data-cy=login-issues-link]").should("be.visible");
//       cy.get("[data-cy=login-issues-link]").click();
//     });
//   });

//   it("Features to help with login exist", () => {
//     cy.get("[data-cy=login-issues-dialog-box]").should("be.visible");
//     cy.get("[data-cy=dialog-box-title]").contains("What issue are you having?");
//     cy.get("[data-cy=activation-email-resend-button]").should("be.visible");
//     cy.get("[data-cy=forgot-password-button]").should("be.visible");
//     cy.get("[data-cy=go-to-login-dialog-box]").should("be.visible");
//   });

//   it("Resend activation email feature works", () => {
//     cy.get("[data-cy=activation-email-resend-button]").click();
//     cy.get("[data-cy=dialog-box-title]").contains("Resend activation Email");
//     cy.fixture("existing-records").then((existing) => {
//       cy.get("[data-cy=email-field]").type(existing.admin.email);
//       cy.get("[data-cy=send-activation-email-button]").click();
//       cy.get(".hot-toast-message").contains("Account already verified");
//       cy.get("[data-cy=email-field]").clear().type(existing.newUser.email);
//       cy.get("[data-cy=send-activation-email-button]").click();
//       cy.get(".hot-toast-message").contains(
//         "If there is an account with this email ID, an email with further instructions should be delivered at this email ID. Please check."
//       );
//     });
//   });

//   it("Forgot password feature works", () => {
//     cy.get("[data-cy=forgot-password-button]").click();
//     cy.get("[data-cy=dialog-box-title]").contains("Send Password Reset Email");
//     cy.fixture("existing-records").then((existing) => {
//       cy.get("[data-cy=email-field]").type(existing.admin.email);
//       cy.get("[data-cy=send-password-reset-email-button]").click();
//       cy.get(".hot-toast-message").contains(
//         "If you have an account with us, you should have received an email with instructions to reset your password. Please check your email inbox."
//       );
//     });
//   });
// });
