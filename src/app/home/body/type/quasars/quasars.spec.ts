import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Quasars } from './quasars';

describe('Quasars', () => {
  let component: Quasars;
  let fixture: ComponentFixture<Quasars>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Quasars]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Quasars);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
