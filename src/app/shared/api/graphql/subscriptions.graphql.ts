import { gql } from 'apollo-angular';

export const SUBSCRIPTIONS = {
  institution: gql`
    subscription institution {
      notifyInstitution {
        institution {
          id
          name
          location
          city
          bio
        }
        method
      }
    }
  `,
};
