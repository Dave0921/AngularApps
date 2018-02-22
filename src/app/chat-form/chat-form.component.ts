import { Component, OnInit, Input } from '@angular/core';
import { WebsocketService } from '../websocket.service';

@Component({
  selector: 'app-chat-form',
  templateUrl: './chat-form.component.html',
  styleUrls: ['./chat-form.component.css']
})
export class ChatFormComponent implements OnInit{
  msgText: string;
  messages: Array<any>;
  AvatarName: 'Placeholder';
  selfAuthor: boolean = false;
  
  constructor(private _socketService: WebsocketService){}

  ngOnInit(){
    this.messages = new Array();
    this._socketService.on('message-received', (msg: any)=>{
      this.messages.push(msg);
    });
  }
  sendMsg(){
    const message = {
      text: this.msgText,
      date: Date.now(),
      nameUrl: this.AvatarName
    };
    this._socketService.emit('send-message', message);
    this.msgText = '';
  }
  
}
