import { AfterViewChecked, ElementRef, ViewChild, QueryList, ViewChildren, Component, OnInit, Input } from '@angular/core';
import { WebsocketService } from '../websocket.service';
import { ChatserviceService } from '../chatservice.service'
import { Observable } from 'rxjs/Observable'
import * as Rx from 'rxjs/Rx';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/catch';

@Component({
  selector: 'app-chat-form',
  templateUrl: './chat-form.component.html',
  styleUrls: ['./chat-form.component.css']
})
export class ChatFormComponent implements OnInit{
  @ViewChildren('messages') childmessages: QueryList<any>;
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  msgText: string;
  messages: Array<any>;
  AvatarName: 'Placeholder';
  selfAuthor: boolean = false;
  url = 'http://localhost:4200';
  disableScrollDown = false;
  
  constructor(
    private _socketService: WebsocketService,
    private _chatSerivce: ChatserviceService
  ){}

  ngOnInit(){
    this.messages = new Array();
    // get chat log
    this._chatSerivce.getChatLogs(this.url + '/api/chat').subscribe(
      data => {
        this.messages = data;
      },
      err => {
        console.log('Error Occured');
    });
    // when socket io has received msg, push msg into msg array
    this._socketService.on('message-received', (msg: any)=>{
      this.messages.push(msg);
      if (this.messages.length > 200){
        this.messages.shift();
      };
      console.log(this.messages);
    });
  }
  ngAfterViewInit() {
    this.childmessages.changes.subscribe(this.scrollToBottom);
  }
  scrollToBottom = () => {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }
  sendMsg(){
    const message = {
      text: this.msgText,
      date: Date.now(),
      username: this.AvatarName
    };
    this._socketService.emit('send-message', message);
    this.msgText = '';
  }
  
}