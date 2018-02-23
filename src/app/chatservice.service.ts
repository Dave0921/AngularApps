import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as Rx from 'rxjs/Rx';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ChatserviceService {

  constructor(private http: HttpClient) {}
  // gets chat logs stored on nodejs server
  getChatLogs(url:string): Observable<any> {
    return this.http.get(url);
  };
}

