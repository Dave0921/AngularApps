import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable'
import * as Rx from 'rxjs/Rx';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ChatserviceService {

  constructor(private http: Http) {}
  // gets chat logs from nodejs server
  getChatLogs(url:string) {
    return this.http.get(url)
    .map((res:Response) => {
      return res.json()});
  };
}

