import { Component, OnInit, Input } from '@angular/core';
import { WebsocketService } from '../websocket.service';
import { ChatserviceService } from '../chatservice.service'
import { Observable } from 'rxjs/Observable'
import * as Rx from 'rxjs/Rx';
import { Http, Response } from '@angular/http';

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
  url = 'http://localhost:4200';
  
  constructor(
    private _socketService: WebsocketService,
    private _chatSerivce: ChatserviceService
  ){}

  ngOnInit(){
    this._chatSerivce.getChatLogs(this.url + '/api/chat').subscribe((data)=>{
      console.log(data);
    });
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
