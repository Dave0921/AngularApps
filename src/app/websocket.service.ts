import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
// import { Observable } from 'rxjs/Observable'
// import * as Rx from 'rxjs/Rx';
// import { environment } from '../environments/environment';

@Injectable()
export class WebsocketService {
  // Socket connection
  socket:SocketIOClient.Socket;

  constructor() { 
    this.socket = io.connect({transports: ['websocket']});
  }

  on(eventName:any, callback:any){
    if(this.socket){
      this.socket.on(eventName, function(data:any){
        callback(data);
      });
    }
  };

  emit(eventName:any, data:any){
    if(this.socket){
      this.socket.emit(eventName, data);
    }
  };

  removeListener(eventName:any){
    if(this.socket){
      this.socket.removeListener(eventName);
    }
  };

}
