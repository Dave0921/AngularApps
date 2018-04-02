import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ChatserviceService {

  constructor(private http: HttpClient) {}
  // gets chat logs stored on nodejs server
  getChatLogs(url: string): Observable<any> {
    return this.http.get(url);
  }

  getUserName(url: string): Observable<any> {
    return this.http.get(url);
  }

  getUsers(url: string): Observable<any> {
    return this.http.get(url);
  }
}

