import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Calculation } from './calculation';

describe('Calculation', () => {
  let component: Calculation;
  let fixture: ComponentFixture<Calculation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Calculation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Calculation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
