import { FormGroup, FormGroupDirective } from '@angular/forms';
import { SearchParams } from '../../modules/master-grid/table.model';
import { idPayload } from '../../common/models';

export class FetchChatsAction {
  static readonly type = '[CHATS] Fetch';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class FetchNextChatsAction {
  static readonly type = '[CHATS] Fetch Next';

  constructor() {}
}

export class FetchChatMessagesAction {
  static readonly type = '[CHAT MESSAGES] Fetch';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class FetchNextChatMessagesAction {
  static readonly type = '[CHAT MESSAGES] Fetch Next';

  constructor() {}
}
export class ChatMessageSubscriptionAction {
  static readonly type = '[CHAT MESSAGES] Subscribe';

  constructor() {}
}

export class SearchChatMembersAction {
  static readonly type = '[CHATS] Search Members to Chat with';

  constructor(public payload: { query: string }) {}
}
export class ForceRefetchChatsAction {
  static readonly type = '[CHATS] Fetch from network';

  constructor() {}
}

export class ClearChatMembers {
  static readonly type = '[CHAT] Clear Chat Members';

  constructor() {}
}

export class GetIntoChatAction {
  static readonly type = '[CHAT] Get with Member ID';

  constructor(public payload: idPayload) {}
}

export class SelectChatAction {
  static readonly type = '[CHAT] Select Chat';

  constructor(public payload: idPayload) {}
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

export class CreateChatMessageAction {
  static readonly type = '[CHAT] Create Chat Message';

  constructor(public payload: { id: number; message: string }) {}
}
