import { TestBed } from '@angular/core/testing';

import { EmailUpdateService } from './email-update.service';

describe('EmailUpdateService', () => {
  let service: EmailUpdateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmailUpdateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
