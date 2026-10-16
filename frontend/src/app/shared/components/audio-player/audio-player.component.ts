import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioRecorderService } from '../../../core/services/audio-recorder.service';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="audio-widget-card">
      <div class="widget-header">
        <label class="widget-title">Describe what happened (Voice Note)</label>
        <span class="max-time-hint">Max 10 seconds</span>
      </div>

      <!-- State 1: Ready to record -->
      @if (!recorder.state().audioBlob && !recorder.state().isRecording) {
        <div class="record-prompt-box">
          <button
            type="button"
            class="btn-start-record"
            (click)="startRecording()"
            aria-label="Start recording voice note"
          >
            <div class="mic-icon-circle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </div>
            <span>Tap to Record Voice Note</span>
          </button>
          <span class="subtext">Speak clearly in Hindi or your local language about what happened</span>
        </div>
      }

      <!-- State 2: Currently recording -->
      @if (recorder.state().isRecording) {
        <div class="recording-live-bar">
          <button
            type="button"
            class="btn-stop-record pulse"
            (click)="stopRecording()"
            aria-label="Stop recording"
          >
            <span class="stop-square"></span>
          </button>
          <div class="waveform-live">
            @for (bar of liveWaveBars; track $index) {
              <div
                class="wave-bar-live"
                [style.height.px]="getBarHeight($index)"
                [style.animation-delay]="$index * 0.08 + 's'"
              ></div>
            }
          </div>
          <span class="timer-display live">0:0{{ recorder.state().duration }} / 0:10</span>
          <button type="button" class="btn-cancel" (click)="reset()" aria-label="Cancel recording">
            ✕
          </button>
        </div>
      }

      <!-- State 3: Audio recorded and playable (Matches Mockup 4) -->
      @if (recorder.state().audioBlob && !recorder.state().isRecording) {
        <div class="audio-player-bar">
          <!-- Play / Pause button -->
          <button
            type="button"
            class="play-btn-circle"
            (click)="togglePlay()"
            [attr.aria-label]="isPlaying() ? 'Pause voice note' : 'Play voice note'"
          >
            @if (isPlaying()) {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            } @else {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            }
          </button>

          <!-- Waveform track visualization -->
          <div class="waveform-container">
            @for (bar of staticWaveBars; track $index) {
              <div
                class="wave-bar"
                [class.played]="isPlaying() || playbackProgress() > $index / staticWaveBars.length"
                [style.height.px]="bar"
              ></div>
            }
          </div>

          <!-- Timer -->
          <span class="timer-display">0:{{ formattedDuration() }}</span>

          <!-- Re-record button -->
          <button
            type="button"
            class="icon-control-btn"
            (click)="reRecord()"
            title="Re-record voice note"
            aria-label="Re-record voice note"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
          </button>

          <!-- Delete button -->
          <button
            type="button"
            class="icon-control-btn delete-btn"
            (click)="reset()"
            title="Delete recording"
            aria-label="Delete recording"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>

        <div class="badges-row">
          <div class="badge-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            </svg>
            Recording captured
          </div>
        </div>
      }

      @if (recorder.state().error) {
        <div class="error-inline">
          {{ recorder.state().error }}
        </div>
      }
    </div>
  `,
  styles: [
    `
      .audio-widget-card {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .widget-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .widget-title {
        font-weight: 700;
        font-size: 0.95rem;
        color: var(--text-main);
      }
      .max-time-hint {
        font-size: 0.75rem;
        color: var(--text-muted);
        background: var(--bg-card-subtle);
        padding: 3px 8px;
        border-radius: var(--radius-pill);
      }
      .record-prompt-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 18px 12px;
        background: var(--bg-card-subtle);
        border-radius: var(--radius-md);
        border: 1px dashed var(--border-color);
      }
      .btn-start-record {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        background: var(--primary-teal);
        color: #ffffff;
        font-weight: 700;
        font-size: 0.95rem;
        padding: 10px 20px;
        border-radius: var(--radius-pill);
        transition: background 0.15s, transform 0.1s;
      }
      .btn-start-record:hover {
        background: var(--primary-teal-hover);
        transform: translateY(-1px);
      }
      .mic-icon-circle {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .subtext {
        font-size: 0.8rem;
        color: var(--text-muted);
      }
      .recording-live-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: #fff1f2;
        border: 1px solid #fecdd3;
        border-radius: var(--radius-pill);
      }
      .btn-stop-record {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--color-danger);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .stop-square {
        width: 12px;
        height: 12px;
        background: #ffffff;
        border-radius: 2px;
      }
      .waveform-live {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 3px;
        height: 28px;
      }
      .wave-bar-live {
        flex: 1;
        background: var(--color-danger);
        border-radius: 2px;
        animation: waveAnim 0.8s ease-in-out infinite alternate;
      }
      @keyframes waveAnim {
        from {
          height: 6px;
        }
        to {
          height: 24px;
        }
      }
      .timer-display {
        font-family: var(--font-mono);
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-main);
      }
      .timer-display.live {
        color: var(--color-danger);
      }
      .btn-cancel {
        color: var(--text-muted);
        font-size: 1rem;
        padding: 4px;
      }
      .audio-player-bar {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 10px 16px;
        background: #f8fafc;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-pill);
      }
      .play-btn-circle {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: var(--primary-teal);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s;
        flex-shrink: 0;
      }
      .play-btn-circle:hover {
        background: var(--primary-teal-hover);
      }
      .waveform-container {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 2.5px;
        height: 26px;
        overflow: hidden;
      }
      .wave-bar {
        flex: 1;
        min-width: 2px;
        background: #cbd5e1;
        border-radius: 2px;
        transition: background 0.15s;
      }
      .wave-bar.played {
        background: var(--primary-teal);
      }
      .icon-control-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-muted);
        border: 1px solid var(--border-color);
        background: #ffffff;
        transition: all 0.15s;
        flex-shrink: 0;
      }
      .icon-control-btn:hover {
        color: var(--text-main);
        background: var(--bg-card-subtle);
      }
      .delete-btn:hover {
        color: var(--color-danger);
        border-color: #fecaca;
        background: #fef2f2;
      }
      .badges-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .badge-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-muted);
        background: #f1f5f9;
        padding: 4px 10px;
        border-radius: var(--radius-pill);
      }
      .error-inline {
        font-size: 0.8rem;
        color: var(--color-danger);
      }
    `
  ]
})
export class AudioPlayerComponent implements OnDestroy {
  recorder = inject(AudioRecorderService);

  @Output() audioReady = new EventEmitter<Blob>();
  @Output() audioRemoved = new EventEmitter<void>();

  isPlaying = signal(false);
  playbackProgress = signal(0);
  private audioElement: HTMLAudioElement | null = null;

  liveWaveBars = new Array(24).fill(0);
  staticWaveBars = [
    6, 10, 16, 22, 14, 8, 12, 20, 24, 18, 10, 14, 22, 26, 16, 12, 18, 22, 14, 8,
    12, 16, 10, 6, 12, 18, 24, 16, 10, 6
  ];

  async startRecording() {
    const ok = await this.recorder.startRecording(10);
    if (ok) {
      this.isPlaying.set(false);
    }
  }

  stopRecording() {
    this.recorder.stopRecording();
    // Wait for recorder state to finalize
    setTimeout(() => {
      const blob = this.recorder.state().audioBlob;
      if (blob) {
        this.audioReady.emit(blob);
      }
    }, 200);
  }

  reRecord() {
    this.reset();
    this.startRecording();
  }

  reset() {
    this.stopAudio();
    this.recorder.reset();
    this.audioRemoved.emit();
  }

  togglePlay() {
    if (this.isPlaying()) {
      this.stopAudio();
    } else {
      this.playAudio();
    }
  }

  private playAudio() {
    const url = this.recorder.state().audioUrl;
    if (!url) return;

    if (!this.audioElement) {
      this.audioElement = new Audio(url);
      this.audioElement.ontimeupdate = () => {
        if (this.audioElement && this.audioElement.duration) {
          this.playbackProgress.set(
            this.audioElement.currentTime / this.audioElement.duration
          );
        }
      };
      this.audioElement.onended = () => {
        this.isPlaying.set(false);
        this.playbackProgress.set(0);
      };
    } else {
      this.audioElement.src = url;
    }

    this.audioElement.play();
    this.isPlaying.set(true);
  }

  private stopAudio() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    this.isPlaying.set(false);
    this.playbackProgress.set(0);
  }

  formattedDuration(): string {
    const dur = this.recorder.state().duration || 10;
    return dur < 10 ? `0${dur}` : `${dur}`;
  }

  getBarHeight(index: number): number {
    return 8 + ((index * 7) % 18);
  }

  ngOnDestroy() {
    this.stopAudio();
    this.recorder.reset();
  }
}
