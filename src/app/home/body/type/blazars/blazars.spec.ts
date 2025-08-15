import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Blazars } from './blazars';

describe('Blazars', () => {
  let component: Blazars;
  let fixture: ComponentFixture<Blazars>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Blazars]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Blazars);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
