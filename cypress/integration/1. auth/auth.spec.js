/// <reference types="cypress" />

describe("Testing Public Module...", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("has login button", () => {
    cy.get("[data-cy=login-button]").contains("Login");
  });
});
