import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import {
  ClearChatMembers,
  FetchChatsAction,
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

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewInit {
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
  isFetchingChatMembers = false;
  chatMembers: User[];
  opened: boolean = true;
  selectedChat = null;
  draft = '';
  chats: Chat[] = [];
  query: string = '';
  showSearchMemberError: boolean = false;

  constructor(private store: Store) {
    this.chat$.subscribe((val) => {
      this.chat = val;
    });
    this.chatMembers$.subscribe((val) => {
      this.chatMembers = val;
    });
    this.isFetchingChatMembers$.subscribe((val) => {
      this.isFetchingChatMembers = val;
    });
    this.chats$.subscribe((val) => {
      this.chats = val;
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

  clearSearchMember() {
    this.searchMember.nativeElement.value = '';
    this.query = '';
    this.chatMembers = [];
    this.store.dispatch(new ClearChatMembers());
  }

  onSelectChat(chat) {
    this.selectedChat = chat;
    this.draft = '';
  }
  getIntoChat(member) {
    console.log('starting chat with ', member.firstName);
    this.store.dispatch(new GetIntoChatAction({ id: member.id }));
  }
  sendMessage() {
    console.log('Mesage to be sent => ', { draft: this.draft });
  }
}
