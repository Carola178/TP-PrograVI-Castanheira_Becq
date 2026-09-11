import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProximosEstrenos } from './proximos-estrenos';

describe('ProximosEstrenos', () => {
  let component: ProximosEstrenos;
  let fixture: ComponentFixture<ProximosEstrenos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProximosEstrenos],
    }).compileComponents();

    fixture = TestBed.createComponent(ProximosEstrenos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
