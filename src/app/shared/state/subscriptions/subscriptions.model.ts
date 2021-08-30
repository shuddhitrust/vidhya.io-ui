import { SubscriptionsState } from './subscriptions.state';

export interface SubscriptionsStateModel {
  subscriptionsInitiated: boolean;
}

export const defaultSubscriptionsState: SubscriptionsStateModel = {
  subscriptionsInitiated: false,
};
