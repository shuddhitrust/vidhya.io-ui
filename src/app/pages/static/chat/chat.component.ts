import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import {
  defaultLogos,
  defaultSearchParams,
} from 'src/app/shared/common/constants';
import { parseDateTime } from 'src/app/shared/common/functions';
import {
  ClearChatMembers,
  CreateChatMessageAction,
  FetchChatMessagesAction,
  FetchChatsAction,
  FetchNextChatMessagesAction,
  FetchNextChatsAction,
  GetChatAction,
  GetIntoChatAction,
  SearchChatMembersAction,
  SelectChatAction,
} from 'src/app/shared/state/chats/chat.actions';
import { ChatState } from 'src/app/shared/state/chats/chat.state';
import { Observable, fromEvent, ObservedValueOf } from 'rxjs';
import {
  Chat,
  ChatSearchResult,
  ChatTypes,
  User,
} from 'src/app/shared/common/models';
import { ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import {
  filter,
  debounceTime,
  distinctUntilChanged,
  tap,
} from 'rxjs/operators';
import { AuthState } from 'src/app/shared/state/auth/auth.state';
import { ChatUIObject } from 'src/app/shared/state/chats/chat.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewInit {
  @ViewChild('chatWindow', { static: false }) chatWindow: any;
  @ViewChild('searchMember') searchMember: ElementRef;
  @Select(ChatState.listChats)
  chats$: Observable<ChatUIObject[]>;
  @Select(ChatState.getChatSearchResults)
  chatSearch$: Observable<ChatSearchResult[]>;
  @Select(ChatState.getIsFetchingChatMembers)
  isFetchingChatMembers$: Observable<boolean>;
  @Select(ChatState.getIsFetchingChatMessages)
  isFetchingChatMessages$: Observable<boolean>;
  @Select(ChatState.getChatFormRecord)
  chat$: Observable<ChatUIObject>;
  chat: ChatUIObject;
  @Select(ChatState.getIsFetchingChats)
  isFetchingChats$: Observable<boolean>;
  isFetchingChats;
  @Select(ChatState.isCreatingNewChatMessage)
  isCreatingNewChatMessage$: Observable<boolean>;
  isCreatingNewChatMessage: boolean;
  @Select(AuthState.getCurrentMember)
  currentMember$: Observable<User>;
  autoScrollToBottom = true;
  currentMember;
  isFetchingChatMessages = false;
  isFetchingChatMembers = false;
  chatSearchResults: ChatSearchResult[];
  opened: boolean = true;
  draft = '';
  chats: ChatUIObject[] = [];
  query: string = '';
  showSearchMemberError: boolean = false;

  constructor(private store: Store) {
    this.chat$.subscribe((val) => {
      this.chat = this.prepCurrentChat(val);
      console.log({ autoScrollToBottom: this.autoScrollToBottom });
      if (this.autoScrollToBottom) {
        setTimeout(() => {
          this.scrollToBottom();
        }, 0);
      }
      this.autoScrollToBottom = true;
      this.draft = '';
      console.log('Chat changed => ', { chat: this.chat });
    });
    this.isFetchingChats$.subscribe((val) => {
      this.isFetchingChats = val;
    });
    this.currentMember$.subscribe((val) => {
      this.currentMember = val;
    });
    this.isCreatingNewChatMessage$.subscribe((val) => {
      this.isCreatingNewChatMessage = val;
    });
    this.chatSearch$.subscribe((val) => {
      this.chatSearchResults = val;
      console.log('chatSearch => ', { chatMebmers: this.chatSearchResults });
    });
    this.isFetchingChatMembers$.subscribe((val) => {
      this.isFetchingChatMembers = val;
    });
    this.isFetchingChatMessages$.subscribe((val) => {
      this.isFetchingChatMessages = val;
    });
    this.chats$.subscribe((val) => {
      this.chats = val;
      console.log('chats => ', { chats: val });
    });
    this.store.dispatch(
      new FetchChatsAction({ searchParams: defaultSearchParams })
    );
  }
  validSearchQueryExists(): boolean {
    return this.query.length >= 3;
  }
  ngAfterViewInit() {
    // server-side search
    fromEvent(this.searchMember.nativeElement, 'keyup')
      .pipe(
        filter(Boolean),
        debounceTime(300),
        distinctUntilChanged(),
        tap((text) => {
          this.query = this.searchMember.nativeElement.value;
          if (this.query.length > 0 && !this.validSearchQueryExists()) {
            this.showSearchMemberError = true;
          } else {
            this.showSearchMemberError = false;
            this.store.dispatch(
              new SearchChatMembersAction({ query: this.query })
            );
          }
        })
      )
      .subscribe();
  }
  ngOnInit(): void {}
  scrollToBottom(): void {
    console.log('ChatWindow exists => ', { chatWindow: this.chatWindow });
    if (this.chatWindow) {
      console.log('chat window => ', { chatWindow: this.chatWindow });
      this.chatWindow.nativeElement.scrollTop =
        this.chatWindow.nativeElement.scrollHeight;
    }
  }
  prepCurrentChat(chat: ChatUIObject): ChatUIObject {
    console.log('from prepCurrentChat ', { chat });
    let newChat = Object.assign({}, chat);
    if (chat?.chatmessageSet?.length > 1) {
      return {
        ...newChat,
        chatmessageSet: newChat?.chatmessageSet?.slice().reverse(),
      };
    } else return chat;
  }

  clearSearchMember() {
    this.searchMember.nativeElement.value = '';
    this.query = '';
    this.chatSearchResults = [];
    this.store.dispatch(new ClearChatMembers());
  }

  ownMessageOrNot(chatMessage) {
    return (
      chatMessage?.author?.id.toString() == this.currentMember?.id.toString()
    );
  }

  parseDateTimeMethod(timestamp) {
    return parseDateTime(timestamp);
  }

  onSelectChat(chat) {
    console.log('on select chat => ', { chat, thisChat: this.chat });
    if (chat.id != this.chat?.id) {
      this.store.dispatch(new SelectChatAction({ id: chat?.id }));
      this.draft = '';
    }
  }
  onChatScroll() {
    console.log('onChatScroll');
    if (!this.isFetchingChats) {
      this.store.dispatch(new FetchNextChatsAction());
    }
  }

  onChatMessagesScroll() {
    console.log('onChatMessagesScroll');
    if (this.chat?.id && this.chat?.chatmessageSet?.length) {
      this.autoScrollToBottom = false; // Setting this to be true so that it doesn't autoscroll to lowest when chat updates
      if (!this.isFetchingChatMessages) {
        this.store.dispatch(new FetchNextChatMessagesAction());
      }
    }
  }
  getIntoChat(result: ChatSearchResult) {
    if (result.userId) {
      this.store.dispatch(new GetIntoChatAction({ id: result.userId }));
    } else if (result.chatId) {
      this.store.dispatch(new SelectChatAction({ id: result.chatId }));
    }
  }
  showChat() {
    return this.chat?.id != undefined;
  }
  resetChat() {
    this.store.dispatch(new SelectChatAction({ id: null }));
  }
  sendMessage() {
    console.log('sending message...', { draft: this.draft });
    if (this.draft.length) {
      console.log('Mesage to be sent => ', { draft: this.draft });
      if (!this.isCreatingNewChatMessage) {
        this.store.dispatch(
          new CreateChatMessageAction({
            id: this.chat?.id,
            message: this.draft,
          })
        );
      }
    }
  }
}
