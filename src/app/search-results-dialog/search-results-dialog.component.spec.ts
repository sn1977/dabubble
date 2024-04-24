import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResultsDialogComponent } from './search-results-dialog.component';

describe('SearchResultsDialogComponent', () => {
  let component: SearchResultsDialogComponent;
  let fixture: ComponentFixture<SearchResultsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchResultsDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchResultsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
