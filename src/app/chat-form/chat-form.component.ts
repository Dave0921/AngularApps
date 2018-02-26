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
  @ViewChildren('messages') childMessages: QueryList<any>;
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  msgText: string;
  messages: Array<any>;
  users: Array<any>;
  nickName: string;
  selfAuthor: boolean = true;
  joined: boolean = false;
  chaturl = 'http://localhost:4200';
  usernameapiurl = 'https://uinames.com/api/?region=United%20states';
  disableScrollDown = false;

  
  constructor(
    private _socketService: WebsocketService,
    private _chatSerivce: ChatserviceService
  ){}

  ngOnInit(){
    // let user = JSON.parse(localStorage.getItem("user"));
    this.messages = new Array();
    this.users = new Array();   
    // get all users in chat room
    this._chatSerivce.getUsers(this.chaturl + '/api/users').subscribe(
      data => {
        this.users = data;
      },
      err => {
        console.log('Error: could not get users')
      }
    )
    // get chat log
    this._chatSerivce.getChatLogs(this.chaturl + '/api/chat').subscribe(
      data => {
        this.messages = data;
      },
      err => {
        console.log('Error: could not get chat logs');
    });
    // get random user nickname
    this._chatSerivce.getUserName(this.usernameapiurl).subscribe(
      data => {
        this.nickName = data.name + ' ' + data.surname;
        this._socketService.emit('user-connected', this.nickName);
      },
      err => {
        console.log('Error: could not get username')
      }
    );
    // when client has received user connected confirmation, push user nickname into user array
    this._socketService.on('user-connected-received', (user: any) => {
      this.users.push(user);
    });
    // when client has received message received confirmation, push msg into msg array
    this._socketService.on('message-received', (msg: any) => {
      this.messages.push(msg);
      if (this.messages.length > 200){
        this.messages.shift();
      };
      // console.log(this.messages);
    });
  }
  ngAfterViewInit() {
    // when list of messages changes, scroll to the last message
    this.childMessages.changes.subscribe(this.scrollToBottom);
    // when client has received user disconnected confirmation, remove disconnected user
    this._socketService.on('user-disconnect', (userArray: any) => {
      this.users = userArray;
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
    };
    this._socketService.emit('send-message', message);
    this.msgText = '';
  }
  
}