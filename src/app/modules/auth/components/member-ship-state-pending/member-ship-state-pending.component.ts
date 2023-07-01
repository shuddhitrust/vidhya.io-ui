import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { map, filter} from 'rxjs/operators';

@Component({
  selector: 'app-member-ship-state-pending',
  templateUrl: './member-ship-state-pending.component.html',
  styleUrls: ['./member-ship-state-pending.component.scss']
})
export class MemberShipStatePendingComponent implements OnInit {
  currentMember: any;

  constructor(private router:Router, private activatedRoute:ActivatedRoute) { }

  ngOnInit(): void {
    this.currentMember=history.state;
  }
}
