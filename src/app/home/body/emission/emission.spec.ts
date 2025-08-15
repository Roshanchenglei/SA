import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Emission } from './emission';

describe('Emission', () => {
  let component: Emission;
  let fixture: ComponentFixture<Emission>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Emission]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Emission);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
