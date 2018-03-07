import { AfterViewChecked, ElementRef, ViewChild, QueryList, ViewChildren, Component, OnInit, Input } from '@angular/core';
import { WebsocketService } from '../websocket.service';
import { ChatserviceService } from '../chatservice.service'
import { Observable } from 'rxjs/Observable'
import * as Rx from 'rxjs/Rx';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/catch';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-chat-form',
  templateUrl: './chat-form.component.html',
  styleUrls: ['./chat-form.component.css']
})
export class ChatFormComponent implements OnInit{
  @ViewChildren('messages') private childMessages: QueryList<any>;
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  msgText: string;
  messages: Array<any>;
  users: Array<any>;
  nickName: string;
  usernameapiurl = 'https://uinames.com/api/?region=United%20states';
  disableScrollDown = false;
  nickNameColor: string = '#000000';
  cookieValueNick: string = 'UNKNOWN';
  cookieValueNickColor: string = 'UNKNOWN';
  
  constructor(
    private _socketService: WebsocketService,
    private _chatSerivce: ChatserviceService,
    private _cookieService: CookieService
  ){}

  ngOnInit(){
    this.cookieValueNick = this._cookieService.get('Nickname');
    this.cookieValueNickColor = this._cookieService.get('Nicknamecolor');
    this.messages = new Array();
    this.users = new Array();   
    
    if(this.cookieValueNick) {
      this.nickName = this.cookieValueNick;
      this.nickNameColor = this.cookieValueNickColor;
      this._socketService.emit('user-connected', this.nickName);
    }
    else {
      // get random user nickname
      this._chatSerivce.getUserName(this.usernameapiurl).subscribe(
        data => {
          this.nickName = data.name + ' ' + data.surname;
          this._cookieService.set('Nickname', this.nickName );
          this._cookieService.set('Nicknamecolor', this.nickNameColor)
          this._socketService.emit('user-connected', this.nickName);
        },
        err => {
          console.log('Error: could not get nickname');
          this.nickName = 'Guest' + Math.floor(Math.random() * 1000001);
          this._cookieService.set('Nickname', this.nickName );
          this._cookieService.set('Nicknamecolor', this.nickNameColor)
          this._socketService.emit('user-connected', this.nickName);
        }
      );
    }
    // when client has received user connected confirmation, get array of messages and users from server
    this._socketService.on('user-connected-received', (data: any) => {
      this.messages = data.messagearray;
      this.users = data.userarray;
    });
    // when client has received message received confirmation, push msg into msg array
    this._socketService.on('message-received', (msg: any) => {
      this.messages.push(msg);
      if (this.messages.length > 200){
        this.messages.shift();
      };
    });
  }
  ngAfterViewInit() {
    // when list of messages changes, scroll to the last message
    this.childMessages.changes.subscribe(this.scrollToBottom);
    // when client has received user disconnected confirmation, remove disconnected user
    this._socketService.on('user-disconnect', (userArray: any) => {
      this.users = userArray;
    });
    // change nickName color
    this._socketService.on('change-nick-color', (data: any) => {
      // get chat log
      this.messages = data.messagearray;
      // change nickName color if current client's nickname === nickname sent by server
      if (data.msg.nickname === this.nickName) {
        this.nickNameColor = data.msg.nicknamecolor;
        this._cookieService.set('Nicknamecolor', this.nickNameColor);
      }
    });
    // change nickName
    this._socketService.on('change-nick', (data: any) => {
      // get users
      this.users = data.userarray;
      let index = this.users.indexOf(this.nickName);
      if (index === -1) {
        this.nickName = data.nick;
        this._cookieService.set( 'Nickname', this.nickName );
      }
      // get chat log
      this.messages = data.messagearray;
    });
  }
  // scroll to the bottom
  scrollToBottom = () => {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }
  // send message
  sendMsg(){
    const message = {
      text: this.msgText,
      date: Date.now(),
      nickname: this.nickName,
      nicknamecolor: this.nickNameColor
    };
    this._socketService.emit('send-message', message);
    this.msgText = '';
  }
}