import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { TrustService } from '../../core/services/trust.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { UpiPayComponent } from './upi-pay.component';
import {
  PeerAcceptResponse,
  PeerCompleteResponse,
  PeerCreateRequestPayload,
  PeerHelpKind,
  PeerRequestItem,
  PeerRequestStatus
} from '../../core/models/api.models';

import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-nearby-brothers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslocoPipe,
    BadgeComponent,
    SkeletonComponent,
    EmptyStateComponent,
    UpiPayComponent
  ],
  template: `
    <div class="peer-page animate-fade-in">
      <!-- Page Hero Banner -->
      <div class="peer-header-card">
        <div class="header-left">
          <span class="header-pill">{{ 'peer.badge' | transloco }}</span>
          <h1 class="header-title">{{ 'nav.askBrother' | transloco }}</h1>
          <p class="header-desc">
            {{ 'peer.desc' | transloco }}
          </p>
        </div>

        <div class="location-status-box">
          @if (isLocating()) {
            <div class="loc-pill loc-loading">
              <span class="spinner-teal"></span>
              <span>{{ 'peer.loc_detecting' | transloco }}</span>
            </div>
          } @else if (locationError()) {
            <div class="loc-pill loc-error">
              <span>{{ 'peer.loc_denied' | transloco }}</span>
              <button type="button" class="btn-retry-loc" (click)="requestLocation()">{{ 'common.retry' | transloco }}</button>
            </div>
          } @else if (hasLocation()) {
            <div class="loc-pill loc-ready">
              <span class="dot-online"></span>
              <span>{{ 'peer.loc_active' | transloco }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Location Permission Denial Warning Banner -->
      @if (locationError()) {
        <div class="alert-banner alert-danger" role="alert">
          <div class="alert-content">
            <strong>{{ 'peer.loc_required_title' | transloco }}</strong>
            <span>{{ locationError() }}</span>
          </div>
          <button type="button" class="btn-outline-retry" (click)="requestLocation()">
            {{ 'peer.loc_retry_btn' | transloco }}
          </button>
        </div>
      }

      <!-- ===================================================================
           ROW 1: REQUESTER SECTION (PART 1: ASK FOR HELP + PART 2: MY REQUESTS)
           =================================================================== -->
      <div class="section-grid">
        <!-- SCREEN PART 1: ASK FOR HELP (Requester) -->
        <section class="peer-card">
          <div class="card-head">
            <div>
              <h2 class="card-title">{{ 'peer.part1_title' | transloco }}</h2>
              <p class="card-sub">{{ 'peer.part1_sub' | transloco }}</p>
            </div>
            <app-badge variant="teal">Requester</app-badge>
          </div>

          <form (ngSubmit)="submitHelpRequest()" class="peer-form">
            <!-- Kind Selector -->
            <div class="form-group">
              <label class="field-label">{{ 'peer.kind_label' | transloco }}</label>
              <div class="kind-grid">
                <button
                  type="button"
                  class="kind-btn"
                  [class.selected]="kind === 'money'"
                  (click)="selectKind('money')"
                >
                  <span>💸</span>
                  <span>{{ 'peer.kind_money' | transloco }}</span>
                </button>
                <button
                  type="button"
                  class="kind-btn"
                  [class.selected]="kind === 'item'"
                  (click)="selectKind('item')"
                >
                  <span>🔧</span>
                  <span>{{ 'peer.kind_item' | transloco }}</span>
                </button>
                <button
                  type="button"
                  class="kind-btn"
                  [class.selected]="kind === 'medicine'"
                  (click)="selectKind('medicine')"
                >
                  <span>💊</span>
                  <span>{{ 'peer.kind_medicine' | transloco }}</span>
                </button>
                <button
                  type="button"
                  class="kind-btn"
                  [class.selected]="kind === 'other'"
                  (click)="selectKind('other')"
                >
                  <span>🆘</span>
                  <span>{{ 'peer.kind_other' | transloco }}</span>
                </button>
              </div>
            </div>

            <!-- Money-only Fields: Amount & Return Date -->
            @if (kind === 'money') {
              <div class="two-col-row">
                <div class="form-group">
                  <label for="peerAmount" class="field-label">{{ 'peer.amount_label' | transloco }}</label>
                  <input
                    id="peerAmount"
                    type="number"
                    name="amount"
                    [(ngModel)]="amount"
                    min="50"
                    max="10000"
                    placeholder="500"
                    required
                    class="form-control"
                  />
                </div>

                <div class="form-group">
                  <label for="repayByDate" class="field-label">{{ 'peer.return_date_label' | transloco }}</label>
                  <input
                    id="repayByDate"
                    type="date"
                    name="repayBy"
                    [(ngModel)]="repayBy"
                    [min]="minReturnDate"
                    [max]="maxReturnDate"
                    required
                    class="form-control"
                  />
                  <span class="field-hint">{{ 'peer.return_date_hint' | transloco }}</span>
                </div>
              </div>
            }

            <!-- Urgency Selector -->
            <div class="form-group">
              <label class="field-label">{{ 'peer.urgency_label' | transloco }}</label>
              <div class="urgency-row">
                <label class="radio-chip" [class.active]="urgency === 'normal'">
                  <input type="radio" name="urgency" [(ngModel)]="urgency" value="normal" />
                  <span>{{ 'peer.urgency_normal' | transloco }}</span>
                </label>
                <label class="radio-chip urgent" [class.active]="urgency === 'urgent'">
                  <input type="radio" name="urgency" [(ngModel)]="urgency" value="urgent" />
                  <span>🚨 {{ 'peer.urgency_urgent' | transloco }}</span>
                </label>
              </div>
            </div>

            <!-- Note -->
            <div class="form-group">
              <label for="peerNote" class="field-label">{{ 'peer.note_label' | transloco }}</label>
              <textarea
                id="peerNote"
                name="note"
                [(ngModel)]="note"
                rows="2"
                placeholder="e.g. Flat tyre, need assistance..."
                required
                class="form-control"
              ></textarea>
            </div>

            @if (askErrorMsg()) {
              <div class="inline-error-box" role="alert">
                {{ askErrorMsg() }}
              </div>
            }

            <button
              type="submit"
              class="btn-primary-submit"
              [disabled]="!canSubmitRequest() || isSubmittingRequest()"
            >
              @if (isSubmittingRequest()) {
                <span class="spinner"></span>
                <span>{{ 'peer.broadcasting' | transloco }}</span>
              } @else if (!hasLocation()) {
                <span>{{ 'peer.loc_required_title' | transloco }}</span>
              } @else {
                <span>{{ 'peer.broadcast_btn' | transloco }}</span>
              }
            </button>
          </form>
        </section>

        <!-- SCREEN PART 2: MY REQUESTS (Requester) -->
        <section class="peer-card">
          <div class="card-head">
            <div>
              <h2 class="card-title">{{ 'peer.part2_title' | transloco }}</h2>
              <p class="card-sub">{{ 'peer.part2_sub' | transloco }}</p>
            </div>
            <button type="button" class="btn-icon-refresh" (click)="fetchMyRequests(false)">
              ↻ {{ 'common.refresh' | transloco }}
            </button>
          </div>

          @if (loadingMine()) {
            <div class="skeleton-stack">
              <app-skeleton height="110px"></app-skeleton>
              <app-skeleton height="110px"></app-skeleton>
            </div>
          } @else if (errorMine()) {
            <div class="inline-error-box">
              <span>{{ errorMine() }}</span>
              <button type="button" class="btn-text-retry" (click)="fetchMyRequests(true)">{{ 'common.retry' | transloco }}</button>
            </div>
          } @else if (myRequests().length === 0) {
            <app-empty-state
              icon="📡"
              [title]="'peer.no_my_requests' | transloco"
              [message]="'peer.no_my_requests_sub' | transloco"
            ></app-empty-state>
          } @else {
            <div class="requests-stack">
              @for (req of myRequests(); track getReqId(req)) {
                <div
                  class="req-item-card"
                  [class.card-danger]="req.status === 'overdue' || req.status === 'disputed'"
                  [class.card-closed]="req.status === 'repaid' || req.status === 'cancelled' || req.status === 'expired'"
                >
                  <!-- Top Summary Row -->
                  <div class="req-top-row">
                    <div class="req-kind-group">
                      <span class="kind-pill">{{ ('peer.kind_' + req.kind) | transloco }}</span>
                      @if (req.kind === 'money' && req.amount) {
                        <span class="req-amount-bold">₹{{ req.amount }}</span>
                      }
                      @if (req.bonus) {
                        <span class="bonus-pill">+₹{{ req.bonus }} {{ 'peer.thank_you_bonus' | transloco }}</span>
                      }
                      @if (req.urgency === 'urgent') {
                        <app-badge variant="danger">{{ 'peer.urgency_urgent' | transloco }}</app-badge>
                      }
                    </div>
                    <app-badge [variant]="getStatusBadgeVariant(req.status)">
                      {{ ('status.' + req.status) | transloco }}
                    </app-badge>
                  </div>

                  @if (req.note) {
                    <p class="req-note-text">"{{ req.note }}"</p>
                  }

                  <!-- Status Timeline (open, accepted, funded, completed, repaid; overdue and disputed in red) -->
                  <div class="status-timeline" [class.timeline-red]="req.status === 'overdue' || req.status === 'disputed'">
                    @for (step of timelineSteps; track step) {
                      <div
                        class="tl-step"
                        [class.tl-done]="isStepReached(req.status, step)"
                        [class.tl-current]="req.status === step"
                      >
                        <div class="tl-dot"></div>
                        <span class="tl-label">{{ ('status.' + step) | transloco }}</span>
                      </div>
                    }
                    @if (req.status === 'overdue' || req.status === 'disputed') {
                      <div class="tl-step tl-alert">
                        <div class="tl-dot"></div>
                        <span class="tl-label">{{ ('status.' + req.status) | transloco }}</span>
                      </div>
                    }
                  </div>

                  <!-- STATUS-SPECIFIC CONTENT (PART 2 RULES) -->
                  <div class="status-body-box">
                    <!-- STATUS: OPEN -->
                    @if (req.status === 'open') {
                      <div class="status-msg-row">
                        <span class="pulse-dot-teal"></span>
                        <strong>{{ 'peer.waiting_workers' | transloco }}</strong>
                      </div>

                      @if (req.kind === 'money' && req.amount) {
                        <div class="bonus-slider-box">
                          <div class="slider-header">
                            <label [for]="'bonus-' + getReqId(req)" class="slider-label">
                              {{ 'peer.add_bonus_label' | transloco: { bonus: ('₹' + getBonusInputValue(req)) } }}
                            </label>
                            <span class="slider-max">Max ₹{{ getMaxBonus(req) }} (20%)</span>
                          </div>
                          @if (getMaxBonus(req) > (req.bonus || 0)) {
                            <div class="slider-controls">
                              <input
                                [id]="'bonus-' + getReqId(req)"
                                type="range"
                                [min]="(req.bonus || 0) + 1"
                                [max]="getMaxBonus(req)"
                                [ngModel]="getBonusInputValue(req)"
                                (ngModelChange)="setBonusInputValue(getReqId(req), $event)"
                                class="range-slider"
                              />
                              <button
                                type="button"
                                class="btn-sm-teal"
                                [disabled]="
                                  actionBusyId() === getReqId(req) ||
                                  getBonusInputValue(req) <= (req.bonus || 0)
                                "
                                (click)="boostRequest(req)"
                              >
                                {{ 'peer.add_bonus_btn' | transloco }}
                              </button>
                            </div>
                          } @else {
                            <span class="field-hint">{{ 'peer.max_bonus_reached' | transloco }}</span>
                          }
                          <!-- Thank-you bonus disclosure note (Requirement 9) -->
                          <div class="bonus-rule-note">
                            ℹ️ {{ 'peer.bonus_disclaimer' | transloco }}
                          </div>
                        </div>
                      }

                      <div class="card-btn-row">
                        <button
                          type="button"
                          class="btn-cancel-outline"
                          [disabled]="actionBusyId() === getReqId(req)"
                          (click)="cancelRequest(req)"
                        >
                          {{ 'common.cancel' | transloco }}
                        </button>
                      </div>
                    }

                    <!-- STATUS: ACCEPTED -->
                    @if (req.status === 'accepted') {
                      <div class="helper-assigned-banner">
                        <strong>
                          {{ 'peer.helper_accepted' | transloco: { name: req.helper_name || 'Brother', trust: req.helper_trust ?? 80 } }}
                        </strong>
                        @if (req.kind === 'money') {
                          <p class="sub-status-note">{{ 'peer.waiting_helper_upi' | transloco }}</p>
                        }
                      </div>

                      <div class="card-btn-row">
                        @if (req.kind !== 'money') {
                          <button
                            type="button"
                            class="btn-confirm-green"
                            [disabled]="actionBusyId() === getReqId(req)"
                            (click)="completeRequest(req)"
                          >
                            {{ 'peer.received_help_btn' | transloco }}
                          </button>
                          <button
                            type="button"
                            class="btn-cancel-outline"
                            [disabled]="actionBusyId() === getReqId(req)"
                            (click)="cancelRequest(req)"
                          >
                            {{ 'common.cancel' | transloco }}
                          </button>
                        }
                      </div>
                    }

                    <!-- STATUS: FUNDED -->
                    @if (req.status === 'funded') {
                      <div class="funded-alert-box">
                        <strong>{{ 'peer.money_sent_by_helper' | transloco: { name: req.helper_name || 'Helper' } }}</strong>
                        <button
                          type="button"
                          class="btn-confirm-green"
                          [disabled]="actionBusyId() === getReqId(req)"
                          (click)="completeRequest(req)"
                        >
                          {{ 'peer.received_money_btn' | transloco }}
                        </button>
                      </div>
                    }

                    <!-- STATUS: COMPLETED -->
                    @if (req.status === 'completed') {
                      @if (req.kind === 'money') {
                        <div class="return-money-box">
                          <div class="return-headline">
                            {{ 'peer.return_by_countdown' | transloco: { amount: getRepayAmount(req), name: req.helper_name || 'Helper', date: getRepayBy(req) } }}
                          </div>
                          <div class="countdown-meta">
                            <span>⏳ {{ getCountdownText(getRepayBy(req)) }}</span>
                            <span>•</span>
                            <span>{{ 'peer.helper_upi_label' | transloco }} <strong>{{ getHelperUpi(req) }}</strong></span>
                          </div>

                          <app-upi-pay
                            [upi]="getHelperUpi(req)"
                            [name]="req.helper_name || 'Helper'"
                            [amount]="getRepayAmount(req)"
                            [isProcessing]="actionBusyId() === getReqId(req)"
                            (moneySent)="notifyRequesterSentReturn(req)"
                          ></app-upi-pay>
                        </div>
                      } @else {
                        <div class="closed-grey-note">
                          ✓ {{ 'status.completed' | transloco }}
                        </div>
                      }
                    }

                    <!-- STATUS: OVERDUE -->
                    @if (req.status === 'overdue') {
                      <div class="danger-warning-box">
                        <strong>{{ 'peer.overdue_warning' | transloco }}</strong>
                        <div class="countdown-meta">
                          <span>Return ₹{{ getRepayAmount(req) }} to {{ req.helper_name || 'Helper' }}</span>
                          <span>•</span>
                          <span>UPI: <strong>{{ getHelperUpi(req) }}</strong></span>
                        </div>
                        <app-upi-pay
                          [upi]="getHelperUpi(req)"
                          [name]="req.helper_name || 'Helper'"
                          [amount]="getRepayAmount(req)"
                          [isProcessing]="actionBusyId() === getReqId(req)"
                          (moneySent)="notifyRequesterSentReturn(req)"
                        ></app-upi-pay>
                      </div>
                    }

                    <!-- STATUS: DISPUTED -->
                    @if (req.status === 'disputed') {
                      <div class="danger-closed-box">
                        {{ 'peer.disputed_warning' | transloco }}
                      </div>
                    }

                    <!-- STATUS: REPAID, CANCELLED, EXPIRED -->
                    @if (req.status === 'repaid' || req.status === 'cancelled' || req.status === 'expired') {
                      <div class="closed-grey-note">
                        {{ 'peer.request_closed' | transloco }} • {{ ('status.' + req.status) | transloco }}
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </section>
      </div>

      <!-- ===================================================================
           ROW 2: HELPER SECTION (PART 3: REQUESTS NEAR ME + PART 4: MY ACCEPTED REQUESTS)
           =================================================================== -->
      <div class="section-grid">
        <!-- SCREEN PART 3: REQUESTS NEAR ME (Helper) -->
        <section class="peer-card">
          <div class="card-head">
            <div>
              <h2 class="card-title">{{ 'peer.part3_title' | transloco }}</h2>
              <p class="card-sub">{{ 'peer.part3_sub' | transloco }}</p>
            </div>
            <button
              type="button"
              class="btn-icon-refresh"
              [disabled]="!hasLocation()"
              (click)="fetchNearbyRequests(false)"
            >
              ↻ {{ 'common.refresh' | transloco }}
            </button>
          </div>

          @if (!hasLocation() && !isLocating()) {
            <app-empty-state
              icon="📍"
              [title]="'peer.loc_needed_title' | transloco"
              [message]="'peer.loc_needed_sub' | transloco"
            >
              <button type="button" class="btn-sm-teal" (click)="requestLocation()">
                {{ 'peer.enable_loc_btn' | transloco }}
              </button>
            </app-empty-state>
          } @else if (loadingNearby()) {
            <div class="skeleton-stack">
              <app-skeleton height="120px"></app-skeleton>
              <app-skeleton height="120px"></app-skeleton>
            </div>
          } @else if (errorNearby()) {
            <div class="inline-error-box">
              <span>{{ errorNearby() }}</span>
              <button type="button" class="btn-text-retry" (click)="fetchNearbyRequests(true)">{{ 'common.retry' | transloco }}</button>
            </div>
          } @else if (nearbyRequests().length === 0 && justAcceptedList().length === 0) {
            <app-empty-state
              icon="🛣️"
              [title]="'peer.no_nearby_title' | transloco"
              [message]="'peer.no_nearby_sub' | transloco"
            ></app-empty-state>
          } @else {
            <div class="requests-stack">
              <!-- Payment cards shown immediately after clicking Accept -->
              @for (acc of justAcceptedList(); track acc.id) {
                <div class="req-item-card accepted-highlight">
                  <div class="req-top-row">
                    <div>
                      <span class="requester-name-bold">{{ acc.data.requester_name }}</span>
                      <span class="kind-pill" style="margin-left: 8px;">{{ ('peer.kind_' + acc.data.kind) | transloco }}</span>
                    </div>
                    <app-badge variant="success">{{ 'status.accepted' | transloco }}</app-badge>
                  </div>

                  @if (acc.data.note) {
                    <p class="req-note-text">"{{ acc.data.note }}"</p>
                  }

                  @if (acc.data.kind === 'money') {
                    <div class="payment-meta-row">
                      <span>{{ 'peer.amount_colon' | transloco }} <strong>₹ {{ acc.data.amount }}</strong></span>
                      @if (acc.data.bonus !== undefined) {
                        <span>• {{ 'peer.bonus_colon' | transloco }} ₹ {{ acc.data.bonus }}</span>
                      }
                      @if (acc.data.repay_amount) {
                        <span>• {{ 'peer.return_colon' | transloco }} <strong>₹ {{ acc.data.repay_amount }}</strong> {{ 'peer.by_date' | transloco: { date: acc.data.repay_by } }}</span>
                      }
                    </div>

                    <app-upi-pay
                      [upi]="acc.data.requester_upi || ''"
                      [name]="acc.data.requester_name"
                      [amount]="acc.data.amount || 0"
                      [isProcessing]="actionBusyId() === acc.id"
                      (moneySent)="markPaid(acc.id)"
                    ></app-upi-pay>
                  } @else {
                    <div class="helper-assigned-banner">
                      {{ 'peer.accepted_help_banner' | transloco: { name: acc.data.requester_name } }}
                    </div>
                  }
                </div>
              }

              <!-- Open Nearby Requests -->
              @for (item of nearbyRequests(); track getReqId(item)) {
                <div class="req-item-card">
                  <div class="req-top-row">
                    <div class="requester-title-group">
                      <span class="requester-name-bold">{{ item.requester_name || ('peer.verified_brother' | transloco) }}</span>
                      <span class="trust-chip">{{ 'peer.trust_badge' | transloco: { trust: item.requester_trust ?? 80 } }}</span>
                      @if (item.urgency === 'urgent') {
                        <app-badge variant="danger">{{ 'peer.urgency_urgent_badge' | transloco }}</app-badge>
                      }
                    </div>
                    @if (item.distance_km !== undefined) {
                      <span class="distance-pill">📍 {{ 'peer.distance_away' | transloco: { dist: (item.distance_km | number: '1.1-1') } }}</span>
                    }
                  </div>

                  <div class="nearby-details-grid">
                    <div class="detail-chip">
                      <span class="d-label">{{ 'peer.kind_short' | transloco }}:</span>
                      <strong class="d-val">{{ ('peer.kind_' + item.kind) | transloco }}</strong>
                    </div>

                    @if (item.kind === 'money' && item.amount) {
                      <div class="detail-chip">
                        <span class="d-label">{{ 'peer.amount_short' | transloco }}:</span>
                        <strong class="d-val">₹ {{ item.amount }}</strong>
                      </div>
                      <div class="detail-chip highlight-bonus">
                        <strong>{{ 'peer.bonus_chip' | transloco: { bonus: item.bonus ?? 0 } }}</strong>
                      </div>
                      @if (item.repay_amount) {
                        <div class="detail-chip">
                          <span class="d-label">{{ 'peer.return_amount_label' | transloco }}:</span>
                          <strong class="d-val">₹ {{ item.repay_amount }}</strong>
                        </div>
                      }
                      @if (item.repay_by) {
                        <div class="detail-chip">
                          <span class="d-label">{{ 'peer.return_date_label' | transloco }}:</span>
                          <strong class="d-val">{{ item.repay_by }}</strong>
                        </div>
                      }
                    }
                  </div>

                  @if (item.note) {
                    <p class="req-note-text">"{{ item.note }}"</p>
                  }

                  <div class="card-btn-row">
                    <button
                      type="button"
                      class="btn-accept"
                      [disabled]="actionBusyId() === getReqId(item)"
                      (click)="acceptNearby(item)"
                    >
                      ✓ {{ 'peer.accept_btn' | transloco }}
                    </button>
                    <button
                      type="button"
                      class="btn-decline"
                      [disabled]="actionBusyId() === getReqId(item)"
                      (click)="declineNearby(item)"
                    >
                      ✕ {{ 'peer.decline_btn' | transloco }}
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </section>

        <!-- SCREEN PART 4: MY ACCEPTED REQUESTS (Helper) -->
        <section class="peer-card">
          <div class="card-head">
            <div>
              <h2 class="card-title">{{ 'peer.part4_title' | transloco }}</h2>
              <p class="card-sub">{{ 'peer.part4_sub' | transloco }}</p>
            </div>
            <button type="button" class="btn-icon-refresh" (click)="fetchHelpingRequests(false)">
              ↻ {{ 'common.refresh' | transloco }}
            </button>
          </div>

          @if (loadingHelping()) {
            <div class="skeleton-stack">
              <app-skeleton height="110px"></app-skeleton>
              <app-skeleton height="110px"></app-skeleton>
            </div>
          } @else if (errorHelping()) {
            <div class="inline-error-box">
              <span>{{ errorHelping() }}</span>
              <button type="button" class="btn-text-retry" (click)="fetchHelpingRequests(true)">{{ 'common.retry' | transloco }}</button>
            </div>
          } @else if (helpingRequests().length === 0) {
            <app-empty-state
              icon="🤝"
              [title]="'peer.no_accepted_title' | transloco"
              [message]="'peer.no_accepted_sub' | transloco"
            ></app-empty-state>
          } @else {
            <div class="requests-stack">
              @for (help of helpingRequests(); track getReqId(help)) {
                <div
                  class="req-item-card"
                  [class.card-closed]="help.status === 'repaid'"
                >
                  <div class="req-top-row">
                    <div class="requester-title-group">
                      <span class="requester-name-bold">{{ getRequesterName(help) }}</span>
                      <span class="kind-pill">{{ ('peer.kind_' + help.kind) | transloco }}</span>
                      @if (help.kind === 'money' && getHelpingAmount(help)) {
                        <span class="req-amount-bold">₹ {{ getHelpingAmount(help) }}</span>
                      }
                    </div>
                    <app-badge [variant]="getStatusBadgeVariant(help.status)">
                      {{ ('status.' + help.status) | transloco }}
                    </app-badge>
                  </div>

                  <!-- STATUS: ACCEPTED (money) -> Payment card again + "I sent the money" -->
                  @if (help.status === 'accepted') {
                    @if (help.kind === 'money') {
                      <app-upi-pay
                        [upi]="getRequesterUpi(help)"
                        [name]="getRequesterName(help)"
                        [amount]="getHelpingAmount(help)"
                        [isProcessing]="actionBusyId() === getReqId(help)"
                        (moneySent)="markPaid(getReqId(help))"
                      ></app-upi-pay>
                    } @else {
                      <div class="helper-assigned-banner">
                        {{ 'peer.waiting_confirm_by' | transloco: { name: getRequesterName(help) } }}
                      </div>
                    }
                  }

                  <!-- STATUS: FUNDED -> "Waiting for {requester_name} to confirm" + "They did not confirm" -->
                  @if (help.status === 'funded') {
                    <div class="funded-helper-box">
                      <div class="funded-wait-text">
                        {{ 'peer.waiting_confirm_by' | transloco: { name: getRequesterName(help) } }}
                      </div>
                      <button
                        type="button"
                        class="btn-dispute-warn"
                        [disabled]="actionBusyId() === getReqId(help)"
                        (click)="disputeRequest(help)"
                      >
                        {{ 'peer.dispute_btn' | transloco }}
                      </button>
                    </div>
                    @if (disputeMessages()[getReqId(help)]) {
                      <div class="inline-error-box" style="margin-top: 8px;">
                        {{ disputeMessages()[getReqId(help)] }}
                      </div>
                    }
                  }

                  <!-- STATUS: COMPLETED or OVERDUE (money) -> "Waiting for {requester_name} to return Rs {repay_amount} by {repay_by}" + "I got my money back" -->
                  @if (help.status === 'completed' || help.status === 'overdue') {
                    @if (help.kind === 'money') {
                      <div class="return-wait-box">
                        <p class="return-wait-text">
                          {{ 'peer.waiting_repay_text' | transloco: { name: getRequesterName(help), amount: getHelpingRepayAmount(help), date: getHelpingRepayBy(help) } }}
                        </p>
                        <button
                          type="button"
                          class="btn-confirm-green"
                          [disabled]="actionBusyId() === getReqId(help)"
                          (click)="markRepaid(help)"
                        >
                          ✓ {{ 'peer.money_repaid_btn' | transloco }}
                        </button>
                      </div>
                    } @else {
                      <div class="done-badge-box">{{ 'peer.done_label' | transloco }}</div>
                    }
                  }

                  <!-- STATUS: DISPUTED -> "Marked as not confirmed. Your points were added." -->
                  @if (help.status === 'disputed') {
                    <div class="disputed-helper-note">
                      {{ 'peer.disputed_helper_note' | transloco }}
                    </div>
                  }

                  <!-- STATUS: REPAID -> "Done" -->
                  @if (help.status === 'repaid') {
                    <div class="done-badge-box">{{ 'peer.done_label' | transloco }}</div>
                  }
                </div>
              }
            </div>
          }
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      .peer-page { display: flex; flex-direction: column; gap: 24px; }
      .peer-header-card {
        background: linear-gradient(135deg, #0f766e 0%, #042f2e 100%);
        color: #ffffff; border-radius: var(--radius-xl); padding: 32px 36px;
        display: flex; align-items: center; justify-content: space-between;
        gap: 24px; box-shadow: var(--shadow-md);
      }
      .header-pill {
        display: inline-block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase;
        letter-spacing: 0.05em; background: rgba(20, 184, 166, 0.3); border: 1px solid #14b8a6;
        color: #ccfbf1; padding: 4px 12px; border-radius: var(--radius-pill); margin-bottom: 8px;
      }
      .header-title { font-size: 1.85rem; font-weight: 800; margin-bottom: 6px; }
      .header-desc { font-size: 0.92rem; color: #ccfbf1; max-width: 600px; line-height: 1.5; }
      .loc-pill {
        display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px;
        border-radius: var(--radius-pill); font-size: 0.82rem; font-weight: 700;
        background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.25);
      }
      .dot-online { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; }
      .btn-retry-loc {
        background: var(--accent-orange); color: #ffffff; padding: 4px 10px;
        border-radius: var(--radius-pill); font-size: 0.75rem; font-weight: 700;
      }
      .alert-banner {
        display: flex; align-items: center; justify-content: space-between; gap: 16px;
        padding: 14px 20px; border-radius: var(--radius-lg);
      }
      .alert-danger { background: var(--color-danger-bg); border: 1px solid #fecaca; color: var(--color-danger-text); }
      .alert-content { display: flex; flex-direction: column; gap: 2px; font-size: 0.88rem; }
      .btn-outline-retry {
        background: #ffffff; color: var(--color-danger-text); border: 1px solid #fca5a5;
        padding: 8px 14px; border-radius: var(--radius-md); font-weight: 700; font-size: 0.82rem; flex-shrink: 0;
      }
      .section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
      .peer-card {
        background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-xl);
        padding: 28px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: 20px;
      }
      .card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
      .card-title { font-size: 1.25rem; font-weight: 800; color: var(--text-main); }
      .card-sub { font-size: 0.84rem; color: var(--text-muted); margin-top: 2px; }
      .btn-icon-refresh {
        font-size: 0.8rem; font-weight: 700; color: var(--text-muted);
        background: var(--bg-card-subtle); border: 1px solid var(--border-color);
        padding: 6px 12px; border-radius: var(--radius-pill);
      }
      .btn-icon-refresh:hover:not(:disabled) { color: var(--text-main); border-color: var(--primary-teal); }
      .peer-form { display: flex; flex-direction: column; gap: 16px; }
      .form-group { display: flex; flex-direction: column; gap: 6px; }
      .field-label { font-size: 0.86rem; font-weight: 700; color: var(--text-main); }
      .field-hint { font-size: 0.74rem; color: var(--text-muted); }
      .kind-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
      .kind-btn {
        display: flex; flex-direction: column; align-items: center; gap: 4px;
        padding: 10px 8px; border-radius: var(--radius-md); border: 1.5px solid var(--border-color);
        background: var(--bg-card-subtle); font-size: 0.82rem; font-weight: 700; color: var(--text-main);
      }
      .kind-btn.selected {
        border-color: var(--primary-teal); background: var(--primary-teal-surface); color: var(--primary-teal);
      }
      .two-col-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
      .form-control {
        border: 1.5px solid var(--border-color); border-radius: var(--radius-md);
        padding: 10px 12px; font-size: 0.92rem; width: 100%; outline: none;
      }
      .form-control:focus { border-color: var(--primary-teal); }
      .urgency-row { display: flex; gap: 10px; }
      .radio-chip {
        flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
        padding: 9px 12px; border-radius: var(--radius-md); border: 1.5px solid var(--border-color);
        background: var(--bg-card-subtle); font-size: 0.85rem; font-weight: 700; cursor: pointer;
      }
      .radio-chip input { display: none; }
      .radio-chip.active { border-color: var(--primary-teal); background: var(--primary-teal-surface); color: var(--primary-teal); }
      .radio-chip.urgent.active { border-color: var(--color-danger); background: var(--color-danger-bg); color: var(--color-danger-text); }
      .btn-primary-submit {
        background: var(--primary-teal); color: #ffffff; font-weight: 800; font-size: 0.95rem;
        padding: 13px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; gap: 8px;
      }
      .btn-primary-submit:hover:not(:disabled) { background: var(--primary-teal-hover); }
      .btn-primary-submit:disabled { opacity: 0.55; cursor: not-allowed; }
      .skeleton-stack, .requests-stack { display: flex; flex-direction: column; gap: 14px; }
      .req-item-card {
        border: 1.5px solid var(--border-color); border-radius: var(--radius-lg);
        padding: 18px; background: #ffffff; display: flex; flex-direction: column; gap: 12px;
      }
      .req-item-card.card-danger { border-color: var(--color-danger); background: #fff5f5; }
      .req-item-card.card-closed { opacity: 0.65; background: #f8fafc; }
      .req-item-card.accepted-highlight { border-color: var(--primary-teal); background: var(--primary-teal-surface); }
      .req-top-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
      .req-kind-group, .requester-title-group { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
      .kind-pill {
        font-size: 0.72rem; font-weight: 800; background: #f1f5f9; color: var(--text-main);
        padding: 3px 8px; border-radius: var(--radius-sm);
      }
      .req-amount-bold, .requester-name-bold { font-size: 1.05rem; font-weight: 800; color: var(--text-main); }
      .bonus-pill {
        font-size: 0.75rem; font-weight: 700; background: var(--color-warning-bg);
        color: var(--color-warning-text); padding: 3px 8px; border-radius: var(--radius-pill);
      }
      .trust-chip {
        font-size: 0.75rem; font-weight: 700; background: var(--primary-teal-surface);
        color: var(--primary-teal); padding: 3px 8px; border-radius: var(--radius-pill);
      }
      .distance-pill { font-size: 0.78rem; font-weight: 700; color: var(--text-muted); }
      .req-note-text { font-size: 0.86rem; color: var(--text-muted); font-style: italic; }
      .status-timeline {
        display: flex; align-items: center; justify-content: space-between;
        padding: 10px 12px; background: var(--bg-card-subtle); border-radius: var(--radius-md); gap: 4px;
      }
      .status-timeline.timeline-red { background: var(--color-danger-bg); }
      .tl-step { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
      .tl-dot { width: 10px; height: 10px; border-radius: 50%; background: #cbd5e1; }
      .tl-step.tl-done .tl-dot { background: var(--primary-teal); }
      .tl-step.tl-current .tl-dot { background: var(--accent-orange); box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.25); }
      .tl-step.tl-alert .tl-dot { background: var(--color-danger); }
      .tl-label { font-size: 0.68rem; font-weight: 700; text-transform: capitalize; color: var(--text-muted); }
      .tl-step.tl-current .tl-label { color: var(--text-main); font-weight: 800; }
      .tl-step.tl-alert .tl-label { color: var(--color-danger-text); font-weight: 800; }
      .status-body-box { display: flex; flex-direction: column; gap: 10px; }
      .status-msg-row { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; color: var(--primary-teal); }
      .pulse-dot-teal { width: 8px; height: 8px; border-radius: 50%; background: var(--primary-teal); }
      .bonus-slider-box {
        background: var(--bg-card-subtle); border: 1px solid var(--border-color);
        padding: 12px; border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 8px;
      }
      .slider-header { display: flex; justify-content: space-between; font-size: 0.8rem; }
      .slider-max { color: var(--text-muted); font-size: 0.75rem; }
      .slider-controls { display: flex; align-items: center; gap: 10px; }
      .range-slider { flex: 1; accent-color: var(--primary-teal); }
      .btn-sm-teal {
        background: var(--primary-teal); color: #ffffff; font-size: 0.78rem;
        font-weight: 700; padding: 7px 12px; border-radius: var(--radius-sm); flex-shrink: 0;
      }
      .card-btn-row { display: flex; gap: 10px; flex-wrap: wrap; }
      .btn-cancel-outline {
        border: 1px solid #fca5a5; background: #fff1f2; color: var(--color-danger-text);
        font-size: 0.82rem; font-weight: 700; padding: 8px 14px; border-radius: var(--radius-md);
      }
      .btn-confirm-green {
        background: var(--color-success); color: #ffffff; font-size: 0.86rem;
        font-weight: 800; padding: 9px 16px; border-radius: var(--radius-md);
      }
      .helper-assigned-banner, .funded-alert-box, .return-money-box, .funded-helper-box, .return-wait-box {
        background: var(--bg-card-subtle); border: 1px solid var(--border-color);
        padding: 12px; border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 8px; font-size: 0.88rem;
      }
      .sub-status-note { font-size: 0.8rem; color: var(--text-muted); }
      .return-headline { font-weight: 800; font-size: 0.95rem; color: var(--text-main); }
      .countdown-meta, .payment-meta-row { display: flex; flex-wrap: wrap; gap: 8px; font-size: 0.8rem; color: var(--text-muted); }
      .danger-warning-box, .danger-closed-box {
        background: var(--color-danger-bg); border: 1px solid #fca5a5; color: var(--color-danger-text);
        padding: 12px; border-radius: var(--radius-md); font-size: 0.86rem; font-weight: 700;
        display: flex; flex-direction: column; gap: 8px;
      }
      .closed-grey-note, .done-badge-box {
        background: #f1f5f9; color: var(--text-muted); padding: 10px 14px;
        border-radius: var(--radius-md); font-size: 0.84rem; font-weight: 700; text-align: center;
      }
      .disputed-helper-note {
        background: var(--color-warning-bg); color: var(--color-warning-text);
        padding: 10px 14px; border-radius: var(--radius-md); font-size: 0.85rem; font-weight: 700;
      }
      .nearby-details-grid { display: flex; flex-wrap: wrap; gap: 8px; }
      .detail-chip {
        background: var(--bg-card-subtle); border: 1px solid var(--border-color);
        padding: 5px 10px; border-radius: var(--radius-sm); font-size: 0.8rem; display: flex; gap: 4px;
      }
      .detail-chip.highlight-bonus { background: var(--color-warning-bg); border-color: #fde68a; color: var(--color-warning-text); }
      .btn-accept {
        flex: 1; background: var(--primary-teal); color: #ffffff; font-weight: 800;
        font-size: 0.88rem; padding: 9px 16px; border-radius: var(--radius-md);
      }
      .btn-decline {
        background: #f1f5f9; color: var(--text-muted); font-weight: 700;
        font-size: 0.88rem; padding: 9px 16px; border-radius: var(--radius-md);
      }
      .btn-dispute-warn {
        align-self: flex-start; background: var(--color-danger-bg); color: var(--color-danger-text);
        border: 1px solid #fca5a5; font-size: 0.82rem; font-weight: 700; padding: 8px 14px; border-radius: var(--radius-md);
      }
      .inline-error-box {
        background: var(--color-danger-bg); border: 1px solid #fecaca; color: var(--color-danger-text);
        padding: 10px 14px; border-radius: var(--radius-md); font-size: 0.83rem; font-weight: 600;
        display: flex; justify-content: space-between; align-items: center; gap: 8px;
      }
      .btn-text-retry { font-weight: 800; color: var(--color-danger-text); text-decoration: underline; }
      .spinner, .spinner-teal {
        width: 14px; height: 14px; border: 2px solid rgba(255, 255, 255, 0.4);
        border-top-color: #ffffff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      @media (max-width: 1024px) {
        .section-grid { grid-template-columns: 1fr; }
        .peer-header-card { flex-direction: column; align-items: flex-start; }
        .kind-grid, .two-col-row { grid-template-columns: 1fr 1fr; }
      }
    `
  ]
})
export class NearbyBrothersComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private trustService = inject(TrustService);

  // Geolocation state
  lat = signal<number | null>(null);
  lng = signal<number | null>(null);
  isLocating = signal<boolean>(true);
  locationError = signal<string | null>(null);

  // Part 1: Ask for help form state
  kind: PeerHelpKind = 'money';
  amount = 500;
  urgency: 'normal' | 'urgent' = 'normal';
  note = '';
  repayBy = '';
  minReturnDate = '';
  maxReturnDate = '';
  isSubmittingRequest = signal(false);
  askErrorMsg = signal<string | null>(null);

  // Part 2: My requests state
  myRequests = signal<PeerRequestItem[]>([]);
  loadingMine = signal(true);
  errorMine = signal<string | null>(null);
  bonusSliderValues = signal<Record<string, number>>({});
  completedDetailsCache = signal<Record<string, PeerCompleteResponse>>({});

  // Part 3: Nearby requests state
  nearbyRequests = signal<PeerRequestItem[]>([]);
  loadingNearby = signal(false);
  errorNearby = signal<string | null>(null);
  acceptedCache = signal<Record<string, PeerAcceptResponse>>({});
  justAcceptedList = signal<{ id: string; data: PeerAcceptResponse }[]>([]);

  // Part 4: My accepted requests (helping)
  helpingRequests = signal<PeerRequestItem[]>([]);
  loadingHelping = signal(true);
  errorHelping = signal<string | null>(null);
  disputeMessages = signal<Record<string, string>>({});

  // Shared UI state
  actionBusyId = signal<string | null>(null);
  readonly timelineSteps: PeerRequestStatus[] = ['open', 'accepted', 'funded', 'completed', 'repaid'];

  private pollTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.trustService.refresh();
    this.initDateBounds();
    this.requestLocation();
    this.fetchMyRequests(true);
    this.fetchHelpingRequests(true);

    // Poll every 5 seconds and stop on page close
    this.pollTimer = setInterval(() => {
      this.fetchMyRequests(false);
      this.fetchHelpingRequests(false);
      if (this.hasLocation()) {
        this.fetchNearbyRequests(false);
      }
    }, 5000);
  }

  ngOnDestroy() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  hasLocation(): boolean {
    return this.lat() !== null && this.lng() !== null && !this.locationError();
  }

  requestLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.isLocating.set(false);
      this.locationError.set('Geolocation is not supported by your browser.');
      return;
    }

    this.isLocating.set(true);
    this.locationError.set(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.lat.set(pos.coords.latitude);
        this.lng.set(pos.coords.longitude);
        this.isLocating.set(false);
        this.locationError.set(null);
        this.fetchNearbyRequests(true);
      },
      (err) => {
        this.isLocating.set(false);
        let msg = 'Location permission was denied. Please allow location access to ask for help or view nearby brothers.';
        if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Unable to detect your current location. Please check your device GPS settings.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please click Retry.';
        }
        this.locationError.set(msg);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  private initDateBounds() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const maxDate = new Date(now);
    maxDate.setDate(now.getDate() + 30);

    this.minReturnDate = this.formatDateYmd(tomorrow);
    this.maxReturnDate = this.formatDateYmd(maxDate);
    this.repayBy = this.minReturnDate;
  }

  private formatDateYmd(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  selectKind(k: PeerHelpKind) {
    this.kind = k;
  }

  canSubmitRequest(): boolean {
    if (!this.hasLocation()) return false;
    if (!this.note.trim()) return false;
    if (this.kind === 'money') {
      if (!this.amount || this.amount <= 0) return false;
      if (!this.repayBy) return false;
      if (this.repayBy < this.minReturnDate || this.repayBy > this.maxReturnDate) return false;
    }
    return true;
  }

  submitHelpRequest() {
    if (!this.canSubmitRequest()) return;
    this.askErrorMsg.set(null);
    this.isSubmittingRequest.set(true);

    const payload: PeerCreateRequestPayload = {
      kind: this.kind,
      urgency: this.urgency,
      note: this.note.trim(),
      lat: this.lat()!,
      lng: this.lng()!
    };

    if (this.kind === 'money') {
      payload.amount = Number(this.amount);
      payload.repay_by = this.repayBy;
    }

    this.apiService.createPeerRequest(payload).subscribe({
      next: (res) => {
        this.isSubmittingRequest.set(false);
        this.note = '';
        this.toastService.success(
          res.expires_in_minutes
            ? `Help request broadcast! Active for ${res.expires_in_minutes} minutes.`
            : 'Help request sent to nearby brothers!'
        );
        this.fetchMyRequests(false);
      },
      error: (err) => {
        this.isSubmittingRequest.set(false);
        const detail = this.extractDetail(err, 'Could not create help request.');
        this.askErrorMsg.set(detail);
      }
    });
  }

  // =========================================================================
  // PART 2: MY REQUESTS METHODS
  // =========================================================================
  fetchMyRequests(showLoader: boolean) {
    if (showLoader) this.loadingMine.set(true);
    this.apiService.getMyPeerRequests().subscribe({
      next: (res) => {
        this.loadingMine.set(false);
        this.errorMine.set(null);
        const list = this.normalizeList(res);
        this.myRequests.set(list);
      },
      error: (err) => {
        this.loadingMine.set(false);
        if (showLoader) {
          this.errorMine.set(this.extractDetail(err, 'Failed to load your requests.'));
        }
      }
    });
  }

  getMaxBonus(req: PeerRequestItem): number {
    return Math.floor((req.amount || 0) * 0.2);
  }

  getBonusInputValue(req: PeerRequestItem): number {
    const id = this.getReqId(req);
    const saved = this.bonusSliderValues()[id];
    const minNext = (req.bonus || 0) + 1;
    const max = this.getMaxBonus(req);
    if (saved !== undefined && saved >= minNext) {
      return Math.min(saved, max);
    }
    return Math.min(minNext, max);
  }

  setBonusInputValue(id: string, val: number) {
    this.bonusSliderValues.update((m) => ({ ...m, [id]: Number(val) }));
  }

  boostRequest(req: PeerRequestItem) {
    const id = this.getReqId(req);
    const bonus = this.getBonusInputValue(req);
    if (bonus <= (req.bonus || 0) || bonus > this.getMaxBonus(req)) return;

    this.actionBusyId.set(id);
    this.apiService.boostPeerRequest(id, bonus).subscribe({
      next: () => {
        this.actionBusyId.set(null);
        this.toastService.success(`Thank-you bonus updated to Rs ${bonus}!`);
        this.fetchMyRequests(false);
      },
      error: () => {
        this.actionBusyId.set(null);
      }
    });
  }

  cancelRequest(req: PeerRequestItem) {
    const id = this.getReqId(req);
    this.actionBusyId.set(id);
    this.apiService.cancelPeerRequest(id).subscribe({
      next: () => {
        this.actionBusyId.set(null);
        this.toastService.info('Help request cancelled.');
        this.fetchMyRequests(false);
      },
      error: () => {
        this.actionBusyId.set(null);
      }
    });
  }

  completeRequest(req: PeerRequestItem) {
    const id = this.getReqId(req);
    this.actionBusyId.set(id);
    this.apiService.completePeerRequest(id).subscribe({
      next: (res) => {
        this.actionBusyId.set(null);
        this.completedDetailsCache.update((m) => ({ ...m, [id]: res }));
        this.toastService.success(
          res.helper_points_given
            ? `Confirmed! +${res.helper_points_given} points awarded to your helper brother.`
            : 'Confirmed receipt of help!'
        );
        this.fetchMyRequests(false);
        this.trustService.refresh();
      },
      error: () => {
        this.actionBusyId.set(null);
      }
    });
  }

  notifyRequesterSentReturn(req: PeerRequestItem) {
    this.toastService.success(
      `Marked return payment as sent! ${req.helper_name || 'Your helper'} will confirm receipt.`
    );
  }

  getRepayAmount(req: PeerRequestItem): number {
    const id = this.getReqId(req);
    return (
      this.completedDetailsCache()[id]?.repay_amount ??
      req.repay_amount ??
      (req.amount || 0) + (req.bonus || 0)
    );
  }

  getRepayBy(req: PeerRequestItem): string {
    const id = this.getReqId(req);
    return this.completedDetailsCache()[id]?.repay_by || req.repay_by || this.minReturnDate;
  }

  getHelperUpi(req: PeerRequestItem): string {
    const id = this.getReqId(req);
    return this.completedDetailsCache()[id]?.helper_upi || req.helper_upi || '';
  }

  getCountdownText(repayByDate: string): string {
    if (!repayByDate) return '';
    const target = new Date(`${repayByDate}T23:59:59`).getTime();
    const diffMs = target - Date.now();
    if (diffMs <= 0) return 'Return date reached';
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  }

  // =========================================================================
  // PART 3: REQUESTS NEAR ME (HELPER)
  // =========================================================================
  fetchNearbyRequests(showLoader: boolean) {
    if (!this.hasLocation()) return;
    if (showLoader) this.loadingNearby.set(true);

    this.apiService.getNearbyPeerRequests(this.lat()!, this.lng()!).subscribe({
      next: (res) => {
        this.loadingNearby.set(false);
        this.errorNearby.set(null);
        this.nearbyRequests.set(this.normalizeList(res));
      },
      error: (err) => {
        this.loadingNearby.set(false);
        if (showLoader) {
          this.errorNearby.set(this.extractDetail(err, 'Failed to load nearby requests.'));
        }
      }
    });
  }

  acceptNearby(item: PeerRequestItem) {
    const id = this.getReqId(item);
    this.actionBusyId.set(id);
    this.apiService.acceptPeerRequest(id).subscribe({
      next: (res) => {
        this.actionBusyId.set(null);
        this.acceptedCache.update((m) => ({ ...m, [id]: res }));
        this.justAcceptedList.update((list) => [
          { id, data: res },
          ...list.filter((x) => x.id !== id)
        ]);
        this.nearbyRequests.update((list) => list.filter((r) => this.getReqId(r) !== id));
        this.toastService.success(`You accepted ${res.requester_name}'s request!`);
        this.fetchHelpingRequests(false);
        this.trustService.refresh();
      },
      error: () => {
        this.actionBusyId.set(null);
      }
    });
  }

  declineNearby(item: PeerRequestItem) {
    const id = this.getReqId(item);
    this.actionBusyId.set(id);
    this.apiService.declinePeerRequest(id).subscribe({
      next: () => {
        this.actionBusyId.set(null);
        this.nearbyRequests.update((list) => list.filter((r) => this.getReqId(r) !== id));
        this.toastService.info('Request declined.');
      },
      error: () => {
        this.actionBusyId.set(null);
      }
    });
  }

  markPaid(id: string) {
    this.actionBusyId.set(id);
    this.apiService.markPaidPeerRequest(id).subscribe({
      next: () => {
        this.actionBusyId.set(null);
        this.justAcceptedList.update((list) => list.filter((x) => x.id !== id));
        this.toastService.success('Marked as paid! Waiting for requester to confirm receipt.');
        this.fetchHelpingRequests(false);
      },
      error: () => {
        this.actionBusyId.set(null);
      }
    });
  }

  // =========================================================================
  // PART 4: MY ACCEPTED REQUESTS (HELPER)
  // =========================================================================
  fetchHelpingRequests(showLoader: boolean) {
    if (showLoader) this.loadingHelping.set(true);
    this.apiService.getHelpingPeerRequests().subscribe({
      next: (res) => {
        this.loadingHelping.set(false);
        this.errorHelping.set(null);
        this.helpingRequests.set(this.normalizeList(res));
      },
      error: (err) => {
        this.loadingHelping.set(false);
        if (showLoader) {
          this.errorHelping.set(this.extractDetail(err, 'Failed to load accepted requests.'));
        }
      }
    });
  }

  disputeRequest(help: PeerRequestItem) {
    const id = this.getReqId(help);
    this.actionBusyId.set(id);
    this.disputeMessages.update((m) => {
      const next = { ...m };
      delete next[id];
      return next;
    });

    this.apiService.disputePeerRequest(id).subscribe({
      next: (res) => {
        this.actionBusyId.set(null);
        if (res.detail || res.message) {
          this.toastService.info(res.detail || res.message!);
        } else {
          this.toastService.success('Marked as not confirmed. Your points were added.');
        }
        this.fetchHelpingRequests(false);
        this.trustService.refresh();
      },
      error: (err) => {
        this.actionBusyId.set(null);
        const msg = this.extractDetail(err, 'Too early to report unconfirmed help.');
        this.disputeMessages.update((m) => ({ ...m, [id]: msg }));
      }
    });
  }

  markRepaid(help: PeerRequestItem) {
    const id = this.getReqId(help);
    this.actionBusyId.set(id);
    this.apiService.markRepaidPeerRequest(id).subscribe({
      next: () => {
        this.actionBusyId.set(null);
        this.toastService.success('Confirmed money returned! Request completed.');
        this.fetchHelpingRequests(false);
        this.trustService.refresh();
      },
      error: () => {
        this.actionBusyId.set(null);
      }
    });
  }

  getRequesterName(help: PeerRequestItem): string {
    const id = this.getReqId(help);
    return help.requester_name || this.acceptedCache()[id]?.requester_name || 'Brother';
  }

  getRequesterUpi(help: PeerRequestItem): string {
    const id = this.getReqId(help);
    return help.requester_upi || this.acceptedCache()[id]?.requester_upi || '';
  }

  getHelpingAmount(help: PeerRequestItem): number {
    const id = this.getReqId(help);
    return help.amount ?? this.acceptedCache()[id]?.amount ?? 0;
  }

  getHelpingRepayAmount(help: PeerRequestItem): number {
    const id = this.getReqId(help);
    return (
      help.repay_amount ??
      this.acceptedCache()[id]?.repay_amount ??
      this.getHelpingAmount(help) + (help.bonus || 0)
    );
  }

  getHelpingRepayBy(help: PeerRequestItem): string {
    const id = this.getReqId(help);
    return help.repay_by || this.acceptedCache()[id]?.repay_by || '';
  }

  // =========================================================================
  // HELPERS
  // =========================================================================
  getReqId(item: PeerRequestItem): string {
    return item.id || item.request_id || '';
  }

  isStepReached(currentStatus: PeerRequestStatus, step: PeerRequestStatus): boolean {
    const order: PeerRequestStatus[] = ['open', 'accepted', 'funded', 'completed', 'repaid'];
    const curIdx = order.indexOf(currentStatus);
    const stepIdx = order.indexOf(step);
    if (curIdx === -1) return false;
    return stepIdx <= curIdx;
  }

  getStatusBadgeVariant(
    status: PeerRequestStatus
  ): 'success' | 'warning' | 'danger' | 'info' | 'teal' | 'neutral' {
    switch (status) {
      case 'open':
        return 'info';
      case 'accepted':
      case 'funded':
        return 'teal';
      case 'completed':
      case 'repaid':
        return 'success';
      case 'overdue':
      case 'disputed':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  private normalizeList(res: unknown): PeerRequestItem[] {
    if (Array.isArray(res)) return res;
    if (res && typeof res === 'object') {
      const obj = res as Record<string, unknown>;
      if (Array.isArray(obj['requests'])) return obj['requests'] as PeerRequestItem[];
      if (Array.isArray(obj['items'])) return obj['items'] as PeerRequestItem[];
    }
    return [];
  }

  private extractDetail(err: any, fallback: string): string {
    if (err?.error) {
      if (typeof err.error === 'string') return err.error;
      if (typeof err.error.detail === 'string') return err.error.detail;
      if (typeof err.error.reason === 'string') return err.error.reason;
      if (typeof err.error.message === 'string') return err.error.message;
    }
    return fallback;
  }
}
