import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Member } from 'src/app/_models/member';

@Component({
  selector: 'app-memeber-card',
  templateUrl: './memeber-card.component.html',
  styleUrls: ['./memeber-card.component.css'],
})
export class MemeberCardComponent implements OnInit {
  @Input() member: Member | undefined;

  constructor() {}

  ngOnInit(): void {}
}
