/// <reference types="cypress" />

describe("Testing Auth Module...", () => {
  beforeEach(() => {
    cy.fixture("routes").as("routes");
    cy.window().then((win) => {
      win.sessionStorage.clear();
      win.localStorage.clear();
    });
  });

  it("Clicking login button shows login dialog box", () => {
    cy.get("@routes").then((routes) => {
      cy.visit(routes.HOME_ROUTE.route);
      cy.get("[data-cy=login-button]").click();
      cy.get("[data-cy=login-dialog-box]").should("be.visible");
      cy.get("[data-cy=dialog-box-title").contains("Login");
      cy.get("[data-cy=username-field]").contains("Username");
      cy.get("[data-cy=password-field]").contains("Password");
      cy.get("[data-cy=remember-me-checkbox]").contains("Remember me");
      cy.get("[data-cy=login-button]").contains("Login");
      cy.get("[data-cy=login-issues-link]").should("be.visible");
      cy.get("[data-cy=registration-link]").contains("Register");
    });
  });

  it("A valid user is able to login successfully", () => {
    cy.get("@routes").then((routes) => {
      cy.visit(routes.HOME_ROUTE.route);
      cy.get("[data-cy=login-button]").click();
      cy.fixture("existing-records").then((existing) => {
        cy.get("[data-cy=username-field]").type(existing.admin.username);
        cy.get("[data-cy=password-field]").type(existing.admin.password);
        cy.get("[data-cy=login-submit-button]").click();
        cy.get("[data-cy=login-dialog-box]").should("not.be.visible");
        cy.get(".hot-toast-message").contains("Logged in successfully!");
      });
    });
  });

  it("Registration dialog box works", () => {
    cy.get("@routes").then((routes) => {
      cy.visit(routes.HOME_ROUTE.route);
      cy.get("[data-cy=login-button]").click();
      cy.get("[data-cy=registration-link]").contains("Register").click();
      cy.get("[data-cy=invitecode-dialog-box]").should("be.visible");
      cy.get("[data-cy=dialog-box-title]").contains("Enter Invite Code");
    });
  });

  it("New user is able to register successfully", () => {
    cy.get("@routes").then((routes) => {
      cy.visit(routes.HOME_ROUTE.route);
      cy.get("[data-cy=login-button]").click();
      cy.get("[data-cy=registration-link]").contains("Register").click();
      cy.fixture("existing-records").then((existing) => {
        cy.get("[data-cy=invitecode-field]").type(
          existing.institution.invitecode
        );
        cy.get("[data-cy=verify-invitation").click();
        cy.get("[data-cy=registration-dialog-box]").should("be.visible");
        cy.get("[data-cy=dialog-box-title]").contains("Register");
        cy.get("[data-cy=registration-username-field]").type(
          existing.newUser.username
        );
        cy.get("[data-cy=registration-email-field]").type(
          existing.newUser.email
        );
        cy.get("[data-cy=registration-password-field]").type(
          existing.newUser.password
        );
        cy.get("[data-cy=registration-password-confirmation-field]").type(
          existing.newUser.password
        );
        cy.get("[data-cy=tnc-agreement-checkbox]").check();
        cy.get("[data-cy=register-submit-button]").click();
        cy.get("[data-cy=registration-dialog-box]").should("not.be.visible");
        cy.get(".hot-toast-message").contains(
          "Registered successfully! Check your email inbox to fully activate your account."
        );
      });
    });
  });
});
