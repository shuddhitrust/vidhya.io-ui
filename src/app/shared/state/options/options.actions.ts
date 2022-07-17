export class FetchMemberOptionsByInstitution {
  static readonly type = '[MEMBER] Fetch members by institution';

  constructor(public payload: { memberInstitutionId: number }) {}
}
export class FetchAdminGroupOptions {
  static readonly type = '[GROUP] Fetch admin groups ';

  constructor() {}
}

export class FetchGraders {
  static readonly type = '[MEMBER] Fetch members with the role of graders';

  constructor() {}
}