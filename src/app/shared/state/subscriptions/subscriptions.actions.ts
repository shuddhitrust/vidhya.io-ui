export class InitiateSubscriptionsAction {
  static readonly type = '[AUTH] Initiate Subscriptions';
  constructor(
    public payload: { authorizeResource: any; isFullyAuthenticated: boolean }
  ) {}
}
