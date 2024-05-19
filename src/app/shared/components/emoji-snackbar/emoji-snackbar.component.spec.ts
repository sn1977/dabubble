import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmojiSnackbarComponent } from './emoji-snackbar.component';

describe('EmojiSnackbarComponent', () => {
  let component: EmojiSnackbarComponent;
  let fixture: ComponentFixture<EmojiSnackbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmojiSnackbarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmojiSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
