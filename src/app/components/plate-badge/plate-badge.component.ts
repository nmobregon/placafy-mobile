import { Component, input } from '@angular/core';

@Component({
  selector: 'app-plate-badge',
  templateUrl: './plate-badge.component.html',
  styleUrls: ['./plate-badge.component.scss'],
})
export class PlateBadgeComponent {
  plateNumber = input.required<string>();
  size = input<'small' | 'large'>('small');
}
