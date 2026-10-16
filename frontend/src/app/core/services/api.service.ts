import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthMeResponse,
  RegisterRequest,
  RegisterResponse,
  RegisterStatusResponse,
  UploadResponse,
  ClaimCreateRequest,
  ClaimCreateResponse,
  ClaimItem,
  PoolBalanceResponse,
  PoolRequestPayload,
  PoolRequestResponse,
  PoolUserRequest,
  PoolRepayResponse,
  PoolContributeRequest,
  PoolContributeResponse,
  LeaderboardEntry,
  HelpConfirmRequest,
  HelpConfirmResponse,
  TrustScoreResponse,
  IncomeAddRequest,
  ComplianceStatusResponse,
  ComplianceRunResponse,
  CompanyPendingWorker,
  CompanyDecisionResponse,
  PeerCreateRequestPayload,
  PeerCreateRequestResponse,
  PeerRequestItem,
  PeerAcceptResponse,
  PeerCompleteResponse,
  PeerActionResponse,
  SupportCreateRequest,
  SupportCreateResponse,
  SupportTicket,
  CompanySupportTicket,
  CompanySupportReplyResponse
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /**
   * Auth & Registration endpoints
   */
  getAuthMe(): Observable<AuthMeResponse> {
    return this.http.get<AuthMeResponse>(`${this.baseUrl}/auth/me`);
  }

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/register`, payload);
  }

  getRegisterStatus(requestId: string): Observable<RegisterStatusResponse> {
    return this.http.get<RegisterStatusResponse>(`${this.baseUrl}/register/status/${requestId}`);
  }

  upload(kind: string, file: Blob | File, filename = 'upload.jpg', customAuth?: string): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('kind', kind);
    formData.append('file', file, filename);
    const headers: Record<string, string> = {};
    if (customAuth) {
      headers['Authorization'] = customAuth.startsWith('Bearer ') ? customAuth : `Bearer ${customAuth}`;
    }
    return this.http.post<UploadResponse>(`${this.baseUrl}/upload`, formData, { headers });
  }

  /**
   * Claims endpoints
   */
  createClaim(payload: ClaimCreateRequest): Observable<ClaimCreateResponse> {
    return this.http.post<ClaimCreateResponse>(`${this.baseUrl}/claims`, payload);
  }

  getClaims(): Observable<ClaimItem[]> {
    return this.http.get<ClaimItem[]>(`${this.baseUrl}/claims`);
  }

  getClaim(id: string): Observable<ClaimItem> {
    return this.http.get<ClaimItem>(`${this.baseUrl}/claims/${id}`);
  }

  /**
   * Community Pool endpoints
   */
  getPoolBalance(): Observable<PoolBalanceResponse> {
    return this.http.get<PoolBalanceResponse>(`${this.baseUrl}/pool`);
  }

  requestPool(payload: PoolRequestPayload): Observable<PoolRequestResponse> {
    return this.http.post<PoolRequestResponse>(`${this.baseUrl}/pool/request`, payload);
  }

  getPoolRequests(): Observable<PoolUserRequest[]> {
    return this.http.get<PoolUserRequest[]>(`${this.baseUrl}/pool/requests`);
  }

  repayPool(id: string): Observable<PoolRepayResponse> {
    return this.http.post<PoolRepayResponse>(`${this.baseUrl}/pool/repay/${id}`, {});
  }

  contributePool(payload: PoolContributeRequest): Observable<PoolContributeResponse> {
    return this.http.post<PoolContributeResponse>(`${this.baseUrl}/pool/contribute`, payload);
  }

  /**
   * Leaderboard & Helper points
   */
  getLeaderboard(): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.baseUrl}/leaderboard`);
  }

  confirmHelp(payload: HelpConfirmRequest): Observable<HelpConfirmResponse> {
    return this.http.post<HelpConfirmResponse>(`${this.baseUrl}/help/confirm`, payload);
  }

  /**
   * Trust Score
   */
  getTrustScore(): Observable<TrustScoreResponse> {
    return this.http.get<TrustScoreResponse>(`${this.baseUrl}/trust/me`);
  }

  /**
   * Income & Government Compliance Schemes
   */
  addIncome(payload: IncomeAddRequest): Observable<{ success: boolean; message?: string }> {
    return this.http.post<{ success: boolean; message?: string }>(`${this.baseUrl}/income`, payload);
  }

  getComplianceStatus(month: string): Observable<ComplianceStatusResponse> {
    const params = new HttpParams().set('month', month);
    return this.http.get<ComplianceStatusResponse>(`${this.baseUrl}/compliance/status`, { params });
  }

  runCompliance(month: string): Observable<ComplianceRunResponse> {
    const params = new HttpParams().set('month', month);
    return this.http.post<ComplianceRunResponse>(`${this.baseUrl}/compliance/run`, {}, { params });
  }

  /**
   * Company Portal
   */
  getCompanyPending(company: string): Observable<CompanyPendingWorker[]> {
    const params = new HttpParams().set('company', company);
    return this.http.get<CompanyPendingWorker[]>(`${this.baseUrl}/company/pending`, { params });
  }

  decisionCompany(id: string, confirm: boolean, manager = 'manager@demo.com'): Observable<CompanyDecisionResponse> {
    const params = new HttpParams().set('confirm', String(confirm)).set('manager', manager);
    return this.http.post<CompanyDecisionResponse>(`${this.baseUrl}/company/decision/${id}`, {}, { params });
  }

  /**
   * Peer-to-Peer Help (Nearby Brothers)
   */
  createPeerRequest(payload: PeerCreateRequestPayload): Observable<PeerCreateRequestResponse> {
    return this.http.post<PeerCreateRequestResponse>(`${this.baseUrl}/peer/request`, payload);
  }

  getMyPeerRequests(): Observable<PeerRequestItem[]> {
    return this.http.get<PeerRequestItem[]>(`${this.baseUrl}/peer/mine`);
  }

  getNearbyPeerRequests(lat: number, lng: number): Observable<PeerRequestItem[]> {
    const params = new HttpParams().set('lat', String(lat)).set('lng', String(lng));
    return this.http.get<PeerRequestItem[]>(`${this.baseUrl}/peer/nearby`, { params });
  }

  getHelpingPeerRequests(): Observable<PeerRequestItem[]> {
    return this.http.get<PeerRequestItem[]>(`${this.baseUrl}/peer/helping`);
  }

  acceptPeerRequest(id: string): Observable<PeerAcceptResponse> {
    return this.http.post<PeerAcceptResponse>(`${this.baseUrl}/peer/${id}/accept`, {});
  }

  declinePeerRequest(id: string): Observable<PeerActionResponse> {
    return this.http.post<PeerActionResponse>(`${this.baseUrl}/peer/${id}/decline`, {});
  }

  boostPeerRequest(id: string, bonus: number): Observable<PeerActionResponse> {
    return this.http.post<PeerActionResponse>(`${this.baseUrl}/peer/${id}/boost`, { bonus });
  }

  markPaidPeerRequest(id: string): Observable<PeerActionResponse> {
    return this.http.post<PeerActionResponse>(`${this.baseUrl}/peer/${id}/mark-paid`, {});
  }

  completePeerRequest(id: string): Observable<PeerCompleteResponse> {
    return this.http.post<PeerCompleteResponse>(`${this.baseUrl}/peer/${id}/complete`, {});
  }

  markRepaidPeerRequest(id: string): Observable<PeerActionResponse> {
    return this.http.post<PeerActionResponse>(`${this.baseUrl}/peer/${id}/mark-repaid`, {});
  }

  disputePeerRequest(id: string): Observable<PeerActionResponse> {
    return this.http.post<PeerActionResponse>(`${this.baseUrl}/peer/${id}/dispute`, {});
  }

  cancelPeerRequest(id: string): Observable<PeerActionResponse> {
    return this.http.post<PeerActionResponse>(`${this.baseUrl}/peer/${id}/cancel`, {});
  }

  /**
   * Help and Support endpoints
   */
  createSupportTicket(payload: SupportCreateRequest): Observable<SupportCreateResponse> {
    return this.http.post<SupportCreateResponse>(`${this.baseUrl}/support`, payload);
  }

  getMySupportTickets(): Observable<SupportTicket[]> {
    return this.http.get<SupportTicket[]>(`${this.baseUrl}/support/mine`);
  }

  getCompanySupport(company: string, status = 'open'): Observable<CompanySupportTicket[]> {
    let params = new HttpParams().set('company', company);
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<CompanySupportTicket[]>(`${this.baseUrl}/company/support`, { params });
  }

  replyCompanySupport(
    id: string,
    reply: string,
    resolve = true,
    manager = 'manager@demo.com'
  ): Observable<CompanySupportReplyResponse> {
    const params = new HttpParams().set('manager', manager);
    return this.http.post<CompanySupportReplyResponse>(
      `${this.baseUrl}/company/support/${id}/reply`,
      { reply, resolve },
      { params }
    );
  }
}


