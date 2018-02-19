import { Component, OnInit } from '@angular/core';
import { WebsocketService } from './websocket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'Chat App';
  
  constructor(private _socketService: WebsocketService){}

  ngOnInit(){
    this._socketService.emit('event1',{
      msg: 'Client to server, can you hear me?'
    });
    this._socketService.on('event2',(data:any)=>{
      console.log(data.msg);
      this._socketService.emit('event3',{
        msg: 'Yes, it works for me'
      });
    });
    this._socketService.on('event4',(data:any)=>{
      console.log(data.msg);
    });
  }

}
