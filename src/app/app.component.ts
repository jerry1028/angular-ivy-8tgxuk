import { Component, OnInit } from '@angular/core';
import { merge, ReplaySubject, Subject, timer } from 'rxjs';
import { startWith, scan, map, repeat, sample, shareReplay, switchMap, takeUntil, filter } from 'rxjs/operators';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent implements OnInit {
  
  second = 103.3;
  totalLapTimes = [10.2, 20.7, 35.9, 48.1, 55, 77.4];
  oddLapTimes = [10.2, 35.9, 55];
  evenLapTimes = [20.7, 48.1, 77.4];

  start$ = new Subject();
  pause$ = new Subject();
  stop$ = new Subject();
  divide$ = new Subject();

  resumeTime$ = new ReplaySubject(1);

  timer$ = timer(0, 100).pipe(
    map(value => value / 10)
  );

  startWithTime = (seconds) => this.timer$.pipe(
    map(timerSecond => timerSecond + seconds)
  );

  pauseOrStop$ = merge(this.pause$, this.stop$);

  second$ = this.start$.pipe(
    switchMap(() => this.resumeTime$),
    switchMap((resumeTime) => this.startWithTime(resumeTime)),
    takeUntil(this.pauseOrStop$),
    repeat(),
    startWith(0),
    shareReplay(1)
  );

  divideSeconds$ = this.second$.pipe(
    sample(this.divide$)
  );

  joinArray = (acc: number[], value: number)=> [...acc, value];

  totalLapTimes$ = this.divideSeconds$.pipe(
    scan(this.joinArray, [])
  );

  indexStartFromOne = (index) => index + 1

  oddLapTimes$ = this.divideSeconds$.pipe(
    filter((_, idx) => this.indexStartFromOne(idx) % 2 === 1),
    scan(this.joinArray, [])
  );

  evenLapTimes$ = this.divideSeconds$.pipe(
    filter((_, idx) => this.indexStartFromOne(idx) % 2 === 0),
    scan(this.joinArray, [])
  );

  ngOnInit() {
    this.resumeTime$.next(0);

    this.second$.pipe(
      sample(this.pause$)
    ).subscribe(value => {
      console.log(value);
      this.resumeTime$.next(value);
    });

    this.stop$.subscribe(() => {
      this.resumeTime$.next(0);
    })
  }

  start() {
    this.start$.next();
  }

  pause() {
    this.pause$.next();
  }

  stop() {
    this.stop$.next();
  }

  divide() {
    this.divide$.next();
  }
}
