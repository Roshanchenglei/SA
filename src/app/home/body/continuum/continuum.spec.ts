import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Continuum } from './continuum';

describe('Continuum', () => {
  let component: Continuum;
  let fixture: ComponentFixture<Continuum>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Continuum]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Continuum);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
