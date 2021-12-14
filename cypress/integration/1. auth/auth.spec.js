/// <reference types="cypress" />

describe("Testing Public Module...", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Displays the institution and learners tabs", () => {
    cy.get("[data-cy=parent-container]").contains("Institutions");
    cy.get("[data-cy=parent-container]").contains("Learners");
  });

  it("has login button", () => {
    cy.get("[data-cy=login-button]").contains("Login");
  });
});
