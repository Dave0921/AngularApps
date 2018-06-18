import { ElementRef, ViewChild, QueryList, ViewChildren, Component, OnInit, AfterViewInit } from '@angular/core';
import { WebsocketService } from '../websocket.service';
import { ChatserviceService } from '../chatservice.service';
import 'rxjs/add/operator/catch';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-chat-form',
  templateUrl: './chat-form.component.html',
  styleUrls: ['./chat-form.component.css']
})
export class ChatFormComponent implements OnInit, AfterViewInit {
  @ViewChildren('messages') private childMessages: QueryList<any>;
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  msgText: string;
  messages: Array<any> = [];
  users: Array<any> = [];
  nickName: string;
  usernameApiUrl = 'https://uinames.com/api/?region=United%20states';
  disableScrollDown = false;
  nickNameColor = '#000000';
  cookieValueNick: string;
  cookieValueNickColor: string;
  nickNameChange = false;
  errorMsg: string;
  displayErrorMsg = false;

  constructor(
    private websocketService: WebsocketService,
    private chatService: ChatserviceService,
    private cookieService: CookieService
  ) {}

  ngOnInit() {
    this.cookieValueNick = this.cookieService.get('Nickname');
    this.cookieValueNickColor = this.cookieService.get('Nicknamecolor');

    if (this.cookieValueNick) {
      this.nickName = this.cookieValueNick;
      this.nickNameColor = this.cookieValueNickColor;
      this.websocketService.emit('user-connected', this.nickName);
    } else {
      // get random user nickname
      this.chatService.getUserName(this.usernameApiUrl).subscribe(
        data => {
          this.nickName = data.name + ' ' + data.surname;
          this.cookieService.set('Nickname', this.nickName );
          this.cookieService.set('Nicknamecolor', this.nickNameColor);
          this.websocketService.emit('user-connected', this.nickName);
        },
        err => {
          console.log('Error: could not get nickname');
          this.nickName = 'Guest' + Math.floor(Math.random() * 1000001);
          this.cookieService.set('Nickname', this.nickName );
          this.cookieService.set('Nicknamecolor', this.nickNameColor);
          this.websocketService.emit('user-connected', this.nickName);
        }
      );
    }
    // when client has received user connected confirmation, get array of messages and users from server
    this.websocketService.on('user-connected-received', (data: any) => {
      this.messages = data.messageArray;
      this.users = data.userArray;
    });
    // when client has received message received confirmation, push msg into msg array
    this.websocketService.on('message-received', (msg: any) => {
      this.messages.push(msg);
      if (this.messages.length > 200) {
        this.messages.shift();
      }
    });
  }
  ngAfterViewInit() {
    // when list of messages changes, scroll to the last message
    this.childMessages.changes.subscribe(this.scrollToBottom);
    // when client has received user disconnected confirmation, remove disconnected user
    this.websocketService.on('user-disconnect', (userArray: any) => {
      this.users = userArray;
    });
    // change nickName color
    this.websocketService.on('change-nick-color', (data: any) => {
      // get chat log
      this.messages = data.messagearray;
      // change nickName color if current client's nickname === nickname sent by server
      if (data.msg.nickname === this.nickName) {
        this.nickNameColor = data.msg.nicknamecolor;
        this.cookieService.set('Nicknamecolor', this.nickNameColor);
      }
    });
    // change nickName
    this.websocketService.on('change-nick', (data: any) => {
      this.users = data.userarray;
      const index = this.users.indexOf(this.nickName);
      if (index === -1) {
        this.nickName = data.nick;
        this.cookieService.set( 'Nickname', this.nickName );
        this.nickNameChange = true;
        setTimeout( () => {
          this.nickNameChange = false;
        }, 4000);
      }
      this.messages = data.messagearray;
    });
    // display error message
    this.websocketService.on('display-error', (data: any) => {
      this.errorMsg = data;
      this.displayErrorMsg = true;
      setTimeout( () => {
        this.displayErrorMsg = false;
      }, 4000);
    });
  }
  // scroll to the bottom
  scrollToBottom = () => {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }
  // send message
  sendMsg() {
    const message = {
      text: this.msgText,
      date: Date.now(),
      nickname: this.nickName,
      nicknamecolor: this.nickNameColor
    };
    this.websocketService.emit('send-message', message);
    this.msgText = '';
  }
}
