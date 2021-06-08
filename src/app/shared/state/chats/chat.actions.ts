import { FormGroup, FormGroupDirective } from '@angular/forms';
import { SearchParams } from '../../abstract/master-grid/table.model';
import { idPayload } from '../../common/models';

export class FetchChatsAction {
  static readonly type = '[CHATS] Fetch';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class ForceRefetchChatsAction {
  static readonly type = '[CHATS] Fetch from network';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class GetChatAction {
  static readonly type = '[CHAT] Get';

  constructor(public payload: idPayload) {}
}

export class CreateUpdateChatAction {
  static readonly type = '[CHAT] Create';

  constructor(
    public payload: { form: FormGroup; formDirective: FormGroupDirective }
  ) {}
}

export class ResetChatFormAction {
  static readonly type = '[CHAT] Reset Form';

  constructor() {}
}

export class DeleteChatAction {
  static readonly type = '[CHAT] Delete';

  constructor(public payload: idPayload) {}
}
