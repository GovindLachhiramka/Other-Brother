import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-webcam-capture',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="webcam-container">
      @if (errorMessage()) {
        <div class="permission-error-box">
          <div class="error-icon">📷❌</div>
          <div class="error-title">Camera Access Required</div>
          <p class="error-desc">{{ errorMessage() }}</p>
          <button type="button" class="btn-retry" (click)="startCamera()">
            Retry Camera Access
          </button>
        </div>
      } @else {
        <div class="circular-frame-wrapper">
          <!-- Live Camera Video -->
          <video
            #videoElement
            autoplay
            playsinline
            muted
            [class.hidden]="isCaptured()"
            class="camera-video"
          ></video>

          <!-- Captured Image Preview -->
          @if (capturedImageUrl()) {
            <img [src]="capturedImageUrl()" class="captured-preview" alt="Live selfie capture" />
          }

          <!-- Oval / Circular Face Guide Overlay -->
          <div class="face-guide-overlay" [class.success]="isCaptured()">
            @if (isCaptured()) {
              <div class="verified-badge">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            }
          </div>
        </div>

        <div class="controls-area">
          @if (!isCaptured()) {
            <button
              type="button"
              class="btn-capture"
              (click)="capturePhoto()"
              [disabled]="!isStreaming()"
            >
              <span class="shutter-inner"></span>
              <span>Take Live Selfie</span>
            </button>
            <p class="guide-text">Position your face inside the circle in good lighting</p>
          } @else {
            <div class="action-buttons">
              <button type="button" class="btn-retake" (click)="retake()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="1 4 1 10 7 10"></polyline>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
                Retake Selfie
              </button>
              <div class="captured-pill">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Selfie Ready
              </div>
            </div>
          }
        </div>
      }

      <!-- Hidden canvas for rasterizing frame -->
      <canvas #canvasElement style="display: none;"></canvas>
    </div>
  `,
  styles: [
    `
      .webcam-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 16px 0;
      }
      .circular-frame-wrapper {
        position: relative;
        width: 240px;
        height: 240px;
        border-radius: 50%;
        overflow: hidden;
        background: #0f172a;
        box-shadow: 0 0 0 4px var(--primary-teal), 0 10px 25px -5px rgba(15, 118, 110, 0.3);
      }
      .camera-video,
      .captured-preview {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transform: scaleX(-1); /* Mirror view for natural selfie */
      }
      .camera-video.hidden {
        display: none;
      }
      .face-guide-overlay {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 2px dashed rgba(255, 255, 255, 0.6);
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: border 0.3s;
      }
      .face-guide-overlay.success {
        border: 4px solid var(--color-success);
        background: rgba(22, 163, 74, 0.1);
      }
      .verified-badge {
        background: var(--color-success);
        color: #ffffff;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-md);
        animation: scalePop 0.3s ease-out;
      }
      @keyframes scalePop {
        0% {
          transform: scale(0.6);
          opacity: 0;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
      .controls-area {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }
      .btn-capture {
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--primary-teal);
        color: #ffffff;
        font-weight: 600;
        font-size: 0.95rem;
        padding: 10px 22px;
        border-radius: var(--radius-pill);
        transition: background 0.2s, transform 0.1s;
      }
      .btn-capture:hover:not(:disabled) {
        background: var(--primary-teal-hover);
        transform: translateY(-1px);
      }
      .btn-capture:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .shutter-inner {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #ffffff;
      }
      .guide-text {
        font-size: 0.8rem;
        color: var(--text-muted);
      }
      .action-buttons {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .btn-retake {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-muted);
        padding: 8px 14px;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-pill);
        background: #ffffff;
        transition: all 0.15s;
      }
      .btn-retake:hover {
        background: var(--bg-card-subtle);
        color: var(--text-main);
      }
      .captured-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--color-success-text);
        background: var(--color-success-bg);
        padding: 8px 16px;
        border-radius: var(--radius-pill);
      }
      .permission-error-box {
        text-align: center;
        padding: 24px;
        background: var(--color-danger-bg);
        border: 1px solid #fecaca;
        border-radius: var(--radius-lg);
        max-width: 360px;
      }
      .error-icon {
        font-size: 2.2rem;
        margin-bottom: 8px;
      }
      .error-title {
        font-weight: 700;
        color: var(--color-danger-text);
        margin-bottom: 6px;
      }
      .error-desc {
        font-size: 0.85rem;
        color: #7f1d1d;
        margin-bottom: 14px;
        line-height: 1.4;
      }
      .btn-retry {
        background: var(--color-danger);
        color: #ffffff;
        font-weight: 600;
        padding: 8px 16px;
        border-radius: var(--radius-md);
        font-size: 0.85rem;
      }
    `
  ]
})
export class WebcamCaptureComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasRef!: ElementRef<HTMLCanvasElement>;

  @Output() photoCaptured = new EventEmitter<Blob>();

  stream: MediaStream | null = null;
  isStreaming = signal(false);
  isCaptured = signal(false);
  capturedImageUrl = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.startCamera();
  }

  async startCamera() {
    this.errorMessage.set(null);
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 640 },
          facingMode: 'user'
        },
        audio: false
      });

      if (this.videoRef?.nativeElement) {
        this.videoRef.nativeElement.srcObject = this.stream;
        this.videoRef.nativeElement.onloadedmetadata = () => {
          this.videoRef.nativeElement.play();
          this.isStreaming.set(true);
        };
      } else {
        // Retry slightly after view is ready
        setTimeout(() => {
          if (this.videoRef?.nativeElement && this.stream) {
            this.videoRef.nativeElement.srcObject = this.stream;
            this.videoRef.nativeElement.play();
            this.isStreaming.set(true);
          }
        }, 100);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      let msg = 'Camera access was denied. Live camera capture is required for facial verification.';
      if (err.name === 'NotFoundError') {
        msg = 'No camera found on your device. Please attach a camera.';
      }
      this.errorMessage.set(msg);
      this.isStreaming.set(false);
    }
  }

  capturePhoto() {
    if (!this.videoRef?.nativeElement || !this.canvasRef?.nativeElement) return;

    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);

    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw square cropped and mirrored
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    const startX = ((video.videoWidth || size) - size) / 2;
    const startY = ((video.videoHeight || size) - size) / 2;
    ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          if (this.capturedImageUrl()) {
            URL.revokeObjectURL(this.capturedImageUrl()!);
          }
          const url = URL.createObjectURL(blob);
          this.capturedImageUrl.set(url);
          this.isCaptured.set(true);
          this.photoCaptured.emit(blob);
        }
      },
      'image/jpeg',
      0.9
    );
  }

  retake() {
    if (this.capturedImageUrl()) {
      URL.revokeObjectURL(this.capturedImageUrl()!);
    }
    this.capturedImageUrl.set(null);
    this.isCaptured.set(false);
    if (!this.stream) {
      this.startCamera();
    }
  }

  ngOnDestroy() {
    this.stopCamera();
    if (this.capturedImageUrl()) {
      URL.revokeObjectURL(this.capturedImageUrl()!);
    }
  }

  private stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }
}
