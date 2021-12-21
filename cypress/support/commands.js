// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add("logout", () => {
  cy.window().then((win) => {
    win.sessionStorage.clear();
    win.localStorage.clear();
  });
});

Cypress.Commands.add("deleteNewUser", () => {
  const apiUrl = Cypress.env("apiUrl");

  cy.request({
    method: "POST",
    url: apiUrl,
    body: {
      operationName: "cyDeleteNewUser",
      variables: null,
      query: `
          query cyDeleteNewUser {
            cyDeleteNewUser {
              ok
            }
          }
        `,
    },
  }).then((res) => {
    console.log(res.body);
  });
});

Cypress.Commands.add("loginSuperAdmin", () => {
  cy.logout();
  cy.fixture("routes").as("routes");
  cy.get("@routes").then((routes) => {
    cy.visit(routes.HOME_ROUTE.route);
    cy.get("[data-cy=login-button]").click();
    cy.fixture("existing-records").then((existing) => {
      cy.get("[data-cy=username-field]").type(existing.admin.username);
      cy.get("[data-cy=password-field]").type(existing.admin.password);
      cy.get("[data-cy=login-submit-button]").click();
      cy.get("[data-cy=login-dialog-box]").should("not.exist");
      cy.get(".hot-toast-message").contains("Logged in successfully!");
    });
  });
});

Cypress.Commands.add("loginLearner", () => {
  cy.logout();
  cy.fixture("routes").as("routes");
  cy.get("@routes").then((routes) => {
    cy.visit(routes.HOME_ROUTE.route);
    cy.get("[data-cy=login-button]").click();
    cy.fixture("existing-records").then((existing) => {
      cy.get("[data-cy=username-field]").type(existing.learner.username);
      cy.get("[data-cy=password-field]").type(existing.learner.password);
      cy.get("[data-cy=login-submit-button]").click();
      cy.get("[data-cy=login-dialog-box]").should("not.exist");
      cy.get(".hot-toast-message").contains("Logged in successfully!");
    });
  });
});

Cypress.Commands.add("createGlobalAnnouncement", () => {
  const apiUrl = Cypress.env("apiUrl");

  cy.request({
    method: "POST",
    url: apiUrl,
    body: {
      operationName: "cyCreateGlobalAnnouncement",
      variables: null,
      query: `
          query cyCreateGlobalAnnouncement {
            cyCreateGlobalAnnouncement {
              ok
            }
          }
        `,
    },
  }).then((res) => {
    console.log(res.body);
  });
});

Cypress.Commands.add("deleteCreatedGlobalAnnouncement", () => {
  const apiUrl = Cypress.env("apiUrl");

  cy.request({
    method: "POST",
    url: apiUrl,
    body: {
      operationName: "cyDeleteGlobalAnnouncement",
      variables: null,
      query: `
          query cyDeleteGlobalAnnouncement {
            cyDeleteGlobalAnnouncement {
              ok
            }
          }
        `,
    },
  }).then((res) => {
    console.log(res.body);
  });
});

Cypress.Commands.add("addLearnerToCourse", () => {
  const apiUrl = Cypress.env("apiUrl");

  cy.request({
    method: "POST",
    url: apiUrl,
    body: {
      operationName: "cyAddLearnerToCourse",
      variables: null,
      query: `
          query cyAddLearnerToCourse {
            cyAddLearnerToCourse {
              ok
            }
          }
        `,
    },
  }).then((res) => {
    console.log(res.body);
  });
});
