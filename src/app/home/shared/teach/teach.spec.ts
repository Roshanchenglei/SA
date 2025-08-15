import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Teach } from './teach';

describe('Teach', () => {
  let component: Teach;
  let fixture: ComponentFixture<Teach>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Teach]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Teach);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
