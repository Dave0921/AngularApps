import { Component, OnInit } from '@angular/core';

import { WebsocketService } from './websocket.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'Chat App';
  // msgText: string;
  // messages: Array<any>;
  // AvatarName: 'Placeholder';
  // selfAuthor: boolean = false;
  
  constructor(private _socketService: WebsocketService){}

  ngOnInit(){
    // this.messages = new Array();
    // this._socketService.on('message-received', (msg: any)=>{
    //   this.messages.push(msg);
    //   console.log(msg);
    //   console.log(this.messages);
    // });
  }
  // sendMsg(){
  //   const message = {
  //     text: this.msgText,
  //     date: Date.now(),
  //     nameUrl: this.AvatarName
  //   };
  //   this._socketService.emit('send-message', message);
  //   this.msgText = '';
  // }
  
}
