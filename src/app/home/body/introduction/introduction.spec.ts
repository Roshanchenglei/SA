import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Introduction } from './introduction';

describe('Introduction', () => {
  let component: Introduction;
  let fixture: ComponentFixture<Introduction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Introduction]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Introduction);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
