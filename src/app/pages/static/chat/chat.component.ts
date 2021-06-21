import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import { parseDateTime } from 'src/app/shared/common/functions';
import {
  ClearChatMembers,
  CreateChatMessageAction,
  FetchChatsAction,
  GetChatAction,
  GetIntoChatAction,
  SearchChatMembersAction,
} from 'src/app/shared/state/chats/chat.actions';
import { ChatState } from 'src/app/shared/state/chats/chat.state';
import { Observable, fromEvent } from 'rxjs';
import { Chat, User } from 'src/app/shared/common/models';
import { ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import {
  filter,
  debounceTime,
  distinctUntilChanged,
  tap,
} from 'rxjs/operators';
import { AuthState } from 'src/app/shared/state/auth/auth.state';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewInit {
  @ViewChild('chatWindow', { static: false }) chatWindow: ElementRef;
  @ViewChild('searchMember') searchMember: ElementRef;
  @Select(ChatState.listChats)
  chats$: Observable<Chat[]>;
  @Select(ChatState.listChatMembers)
  chatMembers$: Observable<User[]>;
  @Select(ChatState.getIsFetchingChatMembers)
  isFetchingChatMembers$: Observable<boolean>;
  @Select(ChatState.getChatFormRecord)
  chat$: Observable<Chat>;
  chat: Chat;
  @Select(ChatState.isCreatingNewChatMessage)
  isCreatingNewChatMessage$: Observable<boolean>;
  isCreatingNewChatMessage: boolean;
  @Select(AuthState.getCurrentMember)
  currentMember$: Observable<User>;
  currentMember;
  chatName;
  memberList;
  isFetchingChatMembers = false;
  chatMembers: User[];
  opened: boolean = true;
  draft = '';
  chats: Chat[] = [];
  query: string = '';
  showSearchMemberError: boolean = false;

  constructor(private store: Store) {
    this.chat$.subscribe((val) => {
      this.chat = val;
      this.draft = '';
      this.constructChatName();
      console.log('Chat changed => ', { chat: this.chat });
      this.scrollToBottom();
    });
    this.currentMember$.subscribe((val) => {
      this.currentMember = val;
    });
    this.isCreatingNewChatMessage$.subscribe((val) => {
      this.isCreatingNewChatMessage = val;
    });
    this.chatMembers$.subscribe((val) => {
      this.chatMembers = val;
    });
    this.isFetchingChatMembers$.subscribe((val) => {
      this.isFetchingChatMembers = val;
    });
    this.chats$.subscribe((val) => {
      this.chats = val;
      console.log('chats => ', { chats: val });
    });
    this.store.dispatch(
      new FetchChatsAction({ searchParams: defaultSearchParams })
    );
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
          if (this.query.length > 0 && this.query.length < 3) {
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
      this.chatWindow.nativeElement.scroll({
        top: this.chatWindow.nativeElement.scrollHeight,
        behavior: 'smooth',
      });
      this.chatWindow.nativeElement.scrollTop =
        this.chatWindow.nativeElement.scrollHeight;
    }
    // try {
    //   this.chatWindowContainer.nativeElement.scrollTop =
    //     this.chatWindowContainer.nativeElement.scrollHeight;
    // } catch (err) {}
  }
  constructChatName() {
    const chatName = this.chat.name;
    let memberList = '';
    console.log('getting chatname from ', { chat: this.chat });
    this.chat?.members?.forEach((m) => {
      console.log('m in foreach array ', {
        m,
        currentUser: this.currentMember,
      });
      memberList +=
        m?.id.toString() === this.currentMember?.id.toString()
          ? ''
          : m.firstName;
    });
    this.chatName = chatName ? chatName : memberList;
    this.memberList = memberList;
    console.log('After constructing the chat name ', { chatName, memberList });
  }
  getChatNameFromChat(chat) {
    console.log('chat in chats ', { chat });
    let chatName = chat.name;
    let memberList = '';
    chat.members.forEach((m) => {
      memberList +=
        m?.id?.toString() === this.currentMember?.id?.toString()
          ? ''
          : m.firstName;
    });
    chatName = chatName ? chatName : memberList;
    return chatName;
  }
  clearSearchMember() {
    this.searchMember.nativeElement.value = '';
    this.query = '';
    this.chatMembers = [];
    this.store.dispatch(new ClearChatMembers());
  }

  ownMessageOrNot(chatMessage) {
    console.log(
      'chat id => ',
      chatMessage?.author?.id,
      'currentMember id => ',
      this.currentMember?.id
    );
    return (
      chatMessage?.author?.id.toString() == this.currentMember?.id.toString()
    );
  }

  parseDateTimeMethod(timestamp) {
    return parseDateTime(timestamp);
  }

  onSelectChat(chat) {
    this.store.dispatch(new GetChatAction({ id: chat.id }));
    this.draft = '';
  }
  getIntoChat(member) {
    console.log('starting chat with ', member.firstName);
    this.store.dispatch(new GetIntoChatAction({ id: member.id }));
  }
  sendMessage() {
    this.scrollToBottom();
    console.log('Mesage to be sent => ', { draft: this.draft });
    if (!this.isCreatingNewChatMessage) {
      this.store.dispatch(
        new CreateChatMessageAction({ id: this.chat?.id, message: this.draft })
      );
    }
  }
}
