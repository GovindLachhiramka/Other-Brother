import {
  Component,
  Input,
  signal,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bg-video',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (shouldLoadVideo() && !videoFailed()) {
      <video
        #bgVideo
        class="bg-video-element"
        autoplay
        [muted]="true"
        muted
        loop
        playsinline
        preload="metadata"
        aria-hidden="true"
        [poster]="poster"
        [src]="src"
        (error)="onVideoError()"
        (loadeddata)="onVideoLoadedData($event)"
        (canplay)="onVideoCanPlay($event)"
      >
        <source [src]="src" type="video/mp4" (error)="onVideoError()" />
      </video>
      <div
        class="bg-video-overlay"
        [class.overlay-teal]="overlayVariant === 'teal'"
        [class.overlay-light]="overlayVariant === 'light'"
        aria-hidden="true"
      ></div>
    } @else if (isReducedMotion() && showPosterOnReducedMotion) {
      <img [src]="poster" alt="" class="bg-poster-element" aria-hidden="true" />
      <div
        class="bg-video-overlay"
        [class.overlay-teal]="overlayVariant === 'teal'"
        [class.overlay-light]="overlayVariant === 'light'"
        aria-hidden="true"
      ></div>
    }
  `,
  styles: [
    `
      :host {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: hidden;
        border-radius: inherit;
        z-index: 0;
        display: block;
      }

      .bg-video-element,
      .bg-poster-element {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 0;
        pointer-events: none;
      }

      .bg-video-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        pointer-events: none;
      }

      .overlay-teal {
        background: linear-gradient(135deg, rgba(15, 118, 110, 0.75) 0%, rgba(4, 47, 46, 0.75) 100%);
      }

      .overlay-light {
        background: rgba(255, 255, 255, 0.88);
      }
    `
  ]
})
export class BgVideoComponent implements OnInit, AfterViewInit {
  @Input() src = '/videos/login-bg.mp4';
  @Input() poster = '/videos/login-poster.jpg';
  @Input() breakpoint = 768;
  @Input() overlayVariant: 'light' | 'teal' = 'light';
  @Input() showPosterOnReducedMotion = false;

  @ViewChild('bgVideo') bgVideoRef?: ElementRef<HTMLVideoElement>;

  videoFailed = signal(false);
  isReducedMotion = signal(false);
  shouldLoadVideo = signal(false);

  ngOnInit(): void {
    this.updateMotionAndScreenState();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateMotionAndScreenState();
  }

  private updateMotionAndScreenState(): void {
    if (typeof window !== 'undefined') {
      const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      const isSmall = window.innerWidth <= this.breakpoint;
      this.isReducedMotion.set(reduced);
      this.shouldLoadVideo.set(!reduced && !isSmall);
    }
  }

  private safePlay(video: HTMLVideoElement | null | undefined): void {
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.play().catch(() => {});
  }

  ngAfterViewInit(): void {
    this.safePlay(this.bgVideoRef?.nativeElement);
  }

  onVideoLoadedData(event: Event): void {
    const video = event.target as HTMLVideoElement;
    this.safePlay(video);
  }

  onVideoCanPlay(event: Event): void {
    const video = event.target as HTMLVideoElement;
    this.safePlay(video);
  }

  onVideoError(): void {
    this.videoFailed.set(true);
  }
}
