import { TestBed, inject } from '@angular/core/testing';

import { ChatserviceService } from './chatservice.service';

describe('ChatserviceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChatserviceService]
    });
  });

  it('should be created', inject([ChatserviceService], (service: ChatserviceService) => {
    expect(service).toBeTruthy();
  }));
});
