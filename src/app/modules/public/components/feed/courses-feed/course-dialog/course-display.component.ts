import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { generateMemberProfileLink } from 'src/app/modules/dashboard/modules/admin/modules/member/state/member.model';
import { GetPublicCourseAction } from 'src/app/modules/public/state/public/public.actions';
import { PublicState } from 'src/app/modules/public/state/public/public.state';
import { PublicCourse } from 'src/app/shared/common/models';

@Component({
  selector: 'app-public-course-display-modal',
  templateUrl: './course-display.component.html',
  styleUrls: ['./course-display.component.scss'],
})
export class CourseDisplayComponent implements AfterViewInit {
  @ViewChildren('iframeContainer') iframeContainer: QueryList<ElementRef>;
  @Input()
  courseId: number;

  @Select(PublicState.getPublicCourseRecord)
  course$: Observable<PublicCourse>;
  course: PublicCourse = null;
  video: any = null;

  @Select(PublicState.getIsFetchingPublicCourseRecord)
  isFetchingCourse$: Observable<boolean>;

  constructor(
    private store: Store,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<CourseDisplayComponent>,
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.courseId = this.data.courseId;
    this.store.dispatch(new GetPublicCourseAction({ id: this.courseId }));
    this.course$.subscribe((val) => {
      if (val) {
        this.course = val;
        if (this.course.video.startsWith('https://www.youtube.com/embed/')) {
          this.video = this.generateVideoUrl(this.course.video);
        } else {
          // @ts-ignore
          this.iframeContainer?._results?.forEach((iframe) => {
            iframe.nativeElement.hidden = true;
          });
        }
      }
    });
  }
  ngAfterViewInit() {
    this.loadStyleToIframe();
  }

  /**
   * Using this to lazy load the iframes of the YouTube videos
   */
  loadStyleToIframe = () => {
    // @ts-ignore
    const allvideos = this.iframeContainer?._results?.map(
      (iframe) => iframe.nativeElement
    );
    console.log(' all videos => ', allvideos);
    allvideos?.forEach((iframe) => {
      iframe?.addEventListener('load', function (event) {
        const new_style_element = document.createElement('style');
        console.log('new_style_element => ', new_style_element);
        new_style_element.textContent =
          '{padding:0;margin:0;overflow:hidden}html,body{height:100%; overflow: hidden;}img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}span{height:1.5em;text-align:center;font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}';
        iframe.contentDocument.head.appendChild(new_style_element);
        console.log('iframe head => ', iframe.contentDocument.head);
      });
    });
  };

  generateVideoUrl(url = null) {
    const videoId = url?.split('/')[url.split('/').length - 1];
    return {
      url: this.sanitizer.bypassSecurityTrustResourceUrl(
        'https://www.youtube.com/embed/' + videoId
      ),
      srcdoc: `<a href=https://www.youtube.com/embed/${videoId}?autoplay=1><img src=https://img.youtube.com/vi/${videoId}/hqdefault.jpg alt='${'Video title'}'><span>▶</span></a>`,
    };
  }

  instructorProfileLink(user) {
    return user?.username ? generateMemberProfileLink(user) : '';
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
