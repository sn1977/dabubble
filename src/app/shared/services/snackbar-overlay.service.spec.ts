import { TestBed } from '@angular/core/testing';

import { SnackbarOverlayService } from './snackbar-overlay.service';

describe('SnackbarOverlayService', () => {
  let service: SnackbarOverlayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SnackbarOverlayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
