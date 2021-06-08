import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  opened: boolean = true;
  selectedChat = null;
  draft = '';
  chats = [
    { name: 'Person 1' },
    { name: 'Person 2' },
    { name: 'Person 3' },
    { name: 'Person 4' },
  ];

  constructor() {}

  ngOnInit(): void {}

  onSelectChat(chat) {
    this.selectedChat = chat;
    this.draft = '';
  }
  sendMessage() {
    console.log('Mesage to be sent => ', { draft: this.draft });
  }
}
