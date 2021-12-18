/// <reference types="cypress" />

describe("Testing Auth Module...", () => {
  before(() => {
    cy.window().then((win) => {
      win.sessionStorage.clear();
      win.localStorage.clear();
    });
  });
  beforeEach(() => {
    cy.fixture("routes").as("routes");
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
        cy.waitFor(100);
        cy.get("[data-cy=login-dialog-box]").should("not.be.visible");
        cy.get(".hot-toast-message").contains("Logged in successfully!");
      });
    });
  });
});
