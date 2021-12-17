/// <reference types="cypress" />

describe("Testing Public Module...", () => {
  before(() => {
    cy.fixture("routes").as("routes");
  });

  it("Displays the institution and learners tabs", () => {
    cy.get("@routes").then((routes) => {
      cy.visit(routes.HOME_ROUTE.route);
      cy.get("[data-cy=parent-container]").contains("Institutions");
      cy.get("[data-cy=parent-container]").contains("Learners");
    });
  });

  it("has login button", () => {
    cy.get("@routes").then((routes) => {
      cy.visit(routes.HOME_ROUTE.route);
      cy.get("[data-cy=login-button]").contains("Login");
    });
  });

  it("Displays institution profile properly", () => {
    cy.get("@routes").then((routes) => {
      cy.fixture("existing-records").then((existing) => {
        cy.visit(
          routes.INSTITUTION_PROFILE_ROUTE.route +
            "/" +
            existing.institution.code
        );

        cy.get("[data-cy=institution-name]").contains(
          existing.institution.name
        );
      });
    });
  });
});
