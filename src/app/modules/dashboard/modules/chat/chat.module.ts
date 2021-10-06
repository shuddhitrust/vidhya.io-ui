import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { ChatState } from 'src/app/shared/state/chats/chat.state';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './components/chat/chat.component';

const declarations = [ChatComponent];
const imports = [SharedModule];

@NgModule({
  declarations,
  imports: [...imports, NgxsModule.forFeature([ChatState]), ChatRoutingModule],
  exports: [...declarations, ...imports],
})
export class ChatModule {}
