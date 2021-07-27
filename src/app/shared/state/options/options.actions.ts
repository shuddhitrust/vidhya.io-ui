export class FetchMemberOptionsByInstitution {
  static readonly type = '[MEMBER] Fetch members by institution';

  constructor(public payload: { memberInstitutionId: string }) {}
}
export class FetchGroupOptionsByInstitution {
  static readonly type = '[GROUP] Fetch groups by institution';

  constructor(
    public payload: { groupInstitutionId: string; filter?: object }
  ) {}
}
