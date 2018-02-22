import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';

import { WebsocketService } from './websocket.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChatFormComponent } from './chat-form/chat-form.component';
import { ChatserviceService } from './chatservice.service'

@NgModule({
  declarations: [
    AppComponent,
    ChatFormComponent
  ],
  imports: [
    NgbModule.forRoot(),
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    WebsocketService,
    ChatserviceService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
