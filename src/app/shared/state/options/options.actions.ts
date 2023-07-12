export class FetchMemberOptionsByInstitution {
  static readonly type = '[MEMBER] Fetch members by institution';

  constructor(public payload: { memberInstitutionId: number }) {}
}

export class FetchDesignationByInstitution {
  
  static readonly type = '[MEMBER] Fetch designation by institution';

  constructor(public payload: { id: number }) {}
}

export class FetchAdminGroupOptions {
  static readonly type = '[GROUP] Fetch admin groups ';

  constructor() {}
}

export class FetchGraders {
  static readonly type = '[MEMBER] Fetch members with the role of graders';

  constructor() {}
}

export class FetchInstitutionsOptions{
  static readonly type = '[MEMBER] Fetch All Institutions';

  constructor() {}
}


export class searchInstitution{
  static readonly type = '[MEMBER] Fetch Institution by Names';

  constructor(public payload: { name: string }) {}
}