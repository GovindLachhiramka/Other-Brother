export interface AuthMeResponse {
  state: 'approved' | 'awaiting_company' | 'rejected' | 'not_registered';
  name?: string;
  phone?: string;
  email?: string;
  company?: string;
  vehicle?: string;
  trust_score?: number;
  helper_points?: number;
  partner_id?: string;
  gender?: 'female' | 'male' | 'other' | string;
  request_id?: string;
  reason?: string;
  attempts_left?: number;
  failed_layer?: string;
}

export interface RegisterRequest {
  phone: string;
  email: string;
  device_id: string;
  upi_id: string;
  upi_name: string;
  platform_name: string;
  company: string;
  partner_id: string;
  gender: 'female' | 'male' | 'other' | string;
  id_uri?: string;
  licence_uri?: string;
  rc_uri?: string;
  selfie_uri: string;
}

export interface RegisterResponse {
  status: 'awaiting_company' | 'rejected';
  request_id?: string;
  reason?: string;
  attempts_left?: number;
  failed_layer?: string;
}

export interface RegisterStatusResponse {
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
}

export interface UploadResponse {
  uri: string;
  kind?: string;
  filename?: string;
}

export interface ClaimCreateRequest {
  photo_uri: string;
  voice_uri: string;
  note?: string;
}

export interface ClaimCreateResponse {
  created: boolean;
  claim_id?: string;
  damage_summary?: string;
  estimated_amount?: number;
  fraud_risk?: 'low' | 'medium' | 'high' | string;
  fraud_reason?: string;
  reason?: string;
}

export interface ClaimItem {
  id: string;
  claim_number?: string;
  title?: string;
  description?: string;
  status: 'submitted' | 'under_review' | 'approved' | 'garage_confirmed' | string;
  date?: string;
  created_at?: string;
  photo_uri?: string;
  voice_uri?: string;
  damage_summary?: string;
  estimated_amount?: number;
  fraud_risk?: string;
  fraud_reason?: string;
  garage_name?: string;
  garage_pickup_date?: string;
}

export interface PoolBalanceResponse {
  balance: number;
  currency?: string;
  open_requests_count?: number;
}

export interface PoolRequestPayload {
  amount: number;
  urgency: 'normal' | 'urgent';
  tag?: string;
  reason?: string;
}

export interface PoolRequestResponse {
  approved: boolean;
  reason?: string;
  amount?: number;
  request_id?: string;
  trust_score?: number;
}

export interface PoolUserRequest {
  id: string;
  amount: number;
  urgency: 'normal' | 'urgent' | string;
  tag?: string;
  status: 'pending' | 'approved' | 'repaid' | 'rejected' | string;
  reason?: string;
  due_date?: string;
  created_at?: string;
}

export interface PoolRepayResponse {
  repaid: boolean;
  new_trust_score: number;
  message?: string;
  reason?: string;
}

export interface PoolContributeRequest {
  amount: number;
}

export interface PoolContributeResponse {
  success: boolean;
  new_balance?: number;
  message?: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  points: number;
  helper_points?: number;
  company?: string;
  avatar_url?: string;
  gender?: 'female' | 'male' | 'other' | string;
}

export interface HelpConfirmRequest {
  helper_id: string;
  help_type: 'urgent' | 'money' | 'item' | 'small';
  note?: string;
}

export interface HelpConfirmResponse {
  success: boolean;
  points_awarded?: number;
  message?: string;
  reason?: string;
}

export interface TrustScoreEvent {
  id?: string;
  date: string;
  change: number;
  reason: string;
}

export interface TrustScoreResponse {
  score: number;
  band?: 'red' | 'amber' | 'green';
  events: TrustScoreEvent[];
}

export interface IncomeAddRequest {
  month: string; // YYYY-MM
  platform: string;
  amount: number;
}

export interface EligibleScheme {
  id: string;
  name: string;
  description: string;
  benefit?: string;
  status?: string;
}

export interface ComplianceStatusResponse {
  month: string;
  total_income: number;
  eligible_schemes: EligibleScheme[];
}

export interface ComplianceRunResponse {
  success: boolean;
  filed_month: string;
  message?: string;
  schemes_enrolled?: string[];
}

export interface CompanyPendingWorker {
  id: string;
  name: string;
  partner_id: string;
  id_last4: string;
  vehicle_number: string;
  company: string;
  created_at?: string;
}

export interface CompanyDecisionResponse {
  success: boolean;
  message?: string;
}

export const COMPANY_LIST = [
  'Demo Foods Ltd',
  'Zomato',
  'Swiggy',
  "Domino's",
  'Pizza Hut',
  "McDonald's",
  'Ekart',
  'Delhivery',
  'Amazon',
  'Shadowfax',
  'Ecom Express',
  'DTDC',
  'Blinkit',
  'Zepto',
  'Swiggy Instamart',
  'BigBasket',
  'Rapido',
  'Uber',
  'Ola',
  'inDrive'
] as const;

export type PeerHelpKind = 'money' | 'item' | 'medicine' | 'other';

export type PeerRequestStatus =
  | 'open'
  | 'accepted'
  | 'funded'
  | 'completed'
  | 'repaid'
  | 'overdue'
  | 'disputed'
  | 'cancelled'
  | 'expired';

export interface PeerCreateRequestPayload {
  kind: PeerHelpKind;
  amount?: number;
  urgency: 'normal' | 'urgent';
  note: string;
  repay_by?: string;
  lat: number;
  lng: number;
}

export interface PeerCreateRequestResponse {
  request_id: string;
  status: PeerRequestStatus;
  expires_in_minutes?: number;
  detail?: string;
}

export interface PeerRequestItem {
  id?: string;
  request_id?: string;
  kind: PeerHelpKind;
  amount?: number;
  bonus?: number;
  repay_amount?: number;
  repay_by?: string;
  urgency?: 'normal' | 'urgent' | string;
  note?: string;
  status: PeerRequestStatus;
  created_at?: string;
  expires_in_minutes?: number;
  requester_name?: string;
  requester_trust?: number;
  requester_upi?: string;
  distance_km?: number;
  helper_name?: string;
  helper_trust?: number;
  helper_upi?: string;
  helper_points_given?: number;
}

export interface PeerAcceptResponse {
  requester_name: string;
  requester_upi?: string;
  amount?: number;
  bonus?: number;
  repay_amount?: number;
  repay_by?: string;
  kind: PeerHelpKind;
  note?: string;
  status?: PeerRequestStatus;
}

export interface PeerCompleteResponse {
  helper_points_given?: number;
  repay_amount?: number;
  repay_by?: string;
  helper_upi?: string;
  helper_name?: string;
  status?: PeerRequestStatus;
}

export interface PeerActionResponse {
  status?: PeerRequestStatus | string;
  detail?: string;
  message?: string;
  bonus?: number;
  repay_amount?: number;
}

export type SupportCategory = 'claim' | 'pool' | 'nearby' | 'account' | 'other';

export interface SupportCreateRequest {
  category: string;
  message: string;
}

export interface SupportCreateResponse {
  success?: boolean;
  id?: string;
  status?: string;
  message?: string;
  detail?: string;
}

export interface SupportTicket {
  id: string;
  category: string;
  message: string;
  status: 'open' | 'resolved' | string;
  created_at?: string;
  reply?: string;
  replied_at?: string;
}

export interface CompanySupportTicket {
  id: string;
  worker_name: string;
  worker_phone?: string;
  company?: string;
  category: string;
  message: string;
  status: 'open' | 'resolved' | string;
  created_at?: string;
  reply?: string;
  replied_at?: string;
}

export interface CompanySupportReplyRequest {
  reply: string;
  resolve: boolean;
}

export interface CompanySupportReplyResponse {
  success: boolean;
  message?: string;
  detail?: string;
}


