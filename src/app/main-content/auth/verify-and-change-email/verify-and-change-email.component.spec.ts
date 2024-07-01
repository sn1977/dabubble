import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyAndChangeEmailComponent } from './verify-and-change-email.component';

describe('VerifyAndChangeEmailComponent', () => {
  let component: VerifyAndChangeEmailComponent;
  let fixture: ComponentFixture<VerifyAndChangeEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyAndChangeEmailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerifyAndChangeEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
