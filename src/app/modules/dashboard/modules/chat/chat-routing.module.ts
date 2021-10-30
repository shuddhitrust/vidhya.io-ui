import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from 'src/app/shared/api/authentication.guard';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { ChatComponent } from './components/chat/chat.component';
const routes: Routes = [
  {
    path: uiroutes.CHAT_ROUTE.route,
    component: ChatComponent,
    canActivate: [AuthenticationGuard],
    data: uiroutes.CHAT_ROUTE.auth,
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatRoutingModule {}
