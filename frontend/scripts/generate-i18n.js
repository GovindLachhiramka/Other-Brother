const fs = require('fs');
const path = require('path');

const i18nDir = path.join(__dirname, '..', 'src', 'assets', 'i18n');

// 1. Read existing en.json
const enPath = path.join(i18nDir, 'en.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Apply changes to en.json
en.nav.askBrother = "Ask Your Other/Brother Here";
en.nav.askBrotherShort = "Ask Brother";
en.nav.help = "Help and Support";

en.auth.new_here_register = "New here? Register";

en.register = {
  upi_hint: "Example: mobilenumber@ybl",
  docs_subtitle: "Upload a clear photo of your Government ID (masked Aadhaar is fine)"
};

delete en.wait.tip_header;
delete en.wait.tip_desc;
delete en.wait.open_portal;

delete en.community.tabs_nearby;
delete en.peer.tabs_nearby;
delete en.peer.tabs_pool;

en.support = {
  title: "Help & Support",
  subtitle: "Need assistance with claims, pool, or your account? Submit a request to our operations team.",
  form_title: "Raise a Help Request",
  category_label: "Category",
  category_select: "Select query category...",
  cat_claim: "Insurance Claim",
  cat_pool: "Community Pool & Loans",
  cat_nearby: "Peer-to-Peer Help",
  cat_account: "Account & Profile",
  cat_other: "Other Queries",
  message_label: "Message",
  message_placeholder: "Please describe your issue in detail (5 - 1000 characters)...",
  message_min_hint: "Min 5 characters, max 1000 characters",
  sending: "Submitting...",
  send_btn: "Send Request",
  submit_success: "Help request sent successfully! Our team will reply shortly.",
  my_requests_title: "My Help Requests",
  no_requests: "No help requests found",
  no_requests_sub: "You have not submitted any help requests yet.",
  status_waiting: "Waiting for reply",
  status_replied: "Replied",
  company_reply_title: "Company Reply"
};

fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
console.log('Updated en.json');
