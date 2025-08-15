import { ComponentFixture, TestBed } from '@angular/core/testing';

import { How } from './how';

describe('How', () => {
  let component: How;
  let fixture: ComponentFixture<How>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [How]
    })
    .compileComponents();

    fixture = TestBed.createComponent(How);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
