import { Injectable, signal } from '@angular/core';

export interface AudioRecordingState {
  isRecording: boolean;
  duration: number; // in seconds
  audioBlob: Blob | null;
  audioUrl: string | null;
  hasPermission: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private timerInterval: any = null;
  private stream: MediaStream | null = null;

  readonly state = signal<AudioRecordingState>({
    isRecording: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
    hasPermission: true,
    error: null
  });

  async startRecording(maxDurationSeconds = 10): Promise<boolean> {
    this.reset();
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        this.state.update((s) => ({
          ...s,
          isRecording: false,
          audioBlob,
          audioUrl
        }));
        this.stopStream();
      };

      this.mediaRecorder.start(100);
      this.state.update((s) => ({
        ...s,
        isRecording: true,
        duration: 0,
        hasPermission: true,
        error: null
      }));

      // Start duration timer
      let elapsed = 0;
      this.timerInterval = setInterval(() => {
        elapsed += 1;
        this.state.update((s) => ({ ...s, duration: elapsed }));
        if (elapsed >= maxDurationSeconds) {
          this.stopRecording();
        }
      }, 1000);

      return true;
    } catch (err: any) {
      console.error('Microphone permission error:', err);
      let errorMsg = 'Microphone permission was denied. Please allow microphone access to record a voice note.';
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No microphone device found on this system.';
      }
      this.state.update((s) => ({
        ...s,
        hasPermission: false,
        error: errorMsg,
        isRecording: false
      }));
      return false;
    }
  }

  stopRecording() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  reset() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.stopStream();
    if (this.state().audioUrl) {
      URL.revokeObjectURL(this.state().audioUrl!);
    }
    this.state.set({
      isRecording: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null,
      hasPermission: true,
      error: null
    });
  }

  private stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }
}
