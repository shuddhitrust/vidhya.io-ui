import { FormGroup, FormGroupDirective } from '@angular/forms';
import { SearchParams } from '../../abstract/master-grid/table.model';
import { idPayload } from '../../common/models';

export class FetchAnnouncements {
  static readonly type = '[ANNOUNCEMENTS] Fetch';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class ForceRefetchAnnouncements {
  static readonly type = '[ANNOUNCEMENTS] Refetch from network';

  constructor(public payload: { searchParams: SearchParams }) {}
}
export class GetAnnouncement {
  static readonly type = '[ANNOUNCEMENT] Get';

  constructor(public payload: idPayload) {}
}

export class ResetAnnouncementForm {
  static readonly type = '[ANNOUNCEMENT] Reset Form';

  constructor() {}
}

export class CreateUpdateAnnouncement {
  static readonly type = '[ANNOUNCEMENT] Create';

  constructor(
    public payload: {
      form: FormGroup;
      formDirective: FormGroupDirective;
    }
  ) {}
}
export class DeleteAnnouncement {
  static readonly type = '[ANNOUNCEMENT] Delete';

  constructor(public payload: idPayload) {}
}
