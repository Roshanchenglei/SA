import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmissionLine } from './emission-line';

describe('EmissionLine', () => {
  let component: EmissionLine;
  let fixture: ComponentFixture<EmissionLine>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmissionLine]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmissionLine);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
