const fs = require('fs');
const path = require('path');

const i18nDir = path.join(__dirname, '..', 'src', 'assets', 'i18n');

function updateLang(lang, newNav, newAuth, newReg, newSupport) {
  const p = path.join(i18nDir, `${lang}.json`);
  if (!fs.existsSync(p)) return;
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));

  // Update nav
  data.nav.askBrother = newNav.askBrother;
  data.nav.askBrotherShort = newNav.askBrotherShort;
  data.nav.help = newNav.help;

  // Update auth
  data.auth.new_here_register = newAuth.new_here_register;

  // Update register
  data.register = newReg;

  // Remove obsolete
  if (data.wait) {
    delete data.wait.tip_header;
    delete data.wait.tip_desc;
    delete data.wait.open_portal;
  }
  if (data.community) {
    delete data.community.tabs_nearby;
  }
  if (data.peer) {
    delete data.peer.tabs_nearby;
    delete data.peer.tabs_pool;
  }

  // Update support
  data.support = newSupport;

  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated ${lang}.json`);
}

// 1. Hindi (hi)
updateLang(
  'hi',
  {
    askBrother: 'यहाँ अपने Other/Brother से मदद मांगें',
    askBrotherShort: 'मदद मांगें',
    help: 'सहायता और सपोर्ट'
  },
  {
    new_here_register: 'नए हैं? रजिस्टर करें'
  },
  {
    upi_hint: 'उदाहरण: mobilenumber@ybl',
    docs_subtitle: 'अपने सरकारी पहचान पत्र की स्पष्ट फोटो अपलोड करें (मास्क्ड आधार भी चलेगा)'
  },
  {
    title: 'सहायता और सपोर्ट',
    subtitle: 'क्लेम, पूल या खाते के संबंध में सहायता चाहिए? हमारी टीम को अनुरोध भेजें।',
    form_title: 'सहायता अनुरोध भेजें',
    category_label: 'श्रेणी',
    category_select: 'श्रेणी चुनें...',
    cat_claim: 'दुर्घटना क्लेम',
    cat_pool: 'कम्युनिटी पूल और ऋण',
    cat_nearby: 'साथी डिलीवरी भाई से मदद',
    cat_account: 'खाता और प्रोफाइल',
    cat_other: 'अन्य प्रश्न',
    message_label: 'संदेश',
    message_placeholder: 'कृपया अपनी समस्या का विस्तार से वर्णन करें (5 से 1000 अक्षर)...',
    message_min_hint: 'न्यूनतम 5 अक्षर, अधिकतम 1000 अक्षर',
    sending: 'भेज रहे हैं...',
    send_btn: 'अनुरोध भेजें',
    submit_success: 'सहायता अनुरोध सफलतापूर्वक भेजा गया! हमारी टीम जल्द ही जवाब देगी।',
    my_requests_title: 'मेरे सहायता अनुरोध',
    no_requests: 'कोई सहायता अनुरोध नहीं मिला',
    no_requests_sub: 'आपने अभी तक कोई सहायता अनुरोध नहीं भेजा है।',
    status_waiting: 'जवाब की प्रतीक्षा है',
    status_replied: 'जवाब दे दिया गया',
    company_reply_title: 'कंपनी का जवाब'
  }
);

// 2. Japanese (ja)
updateLang(
  'ja',
  {
    askBrother: 'ここで Other/Brother に助けを求める',
    askBrotherShort: '仲間に頼む',
    help: 'ヘルプ＆サポート'
  },
  {
    new_here_register: '初めての方はこちら？登録'
  },
  {
    upi_hint: '例: mobilenumber@ybl',
    docs_subtitle: '身分証明書の鮮明な写真をアップロードしてください（マスクされたAadhaarも可）'
  },
  {
    title: 'ヘルプ＆サポート',
    subtitle: '請求、プール、またはアカウントに関するサポートが必要ですか？チームにリクエストを送信してください。',
    form_title: 'ヘルプリクエストを送信',
    category_label: 'カテゴリー',
    category_select: 'カテゴリーを選択...',
    cat_claim: '保険金請求',
    cat_pool: 'コミュニティプール＆融資',
    cat_nearby: 'ピアツーピアの助け合い',
    cat_account: 'アカウント＆プロフィール',
    cat_other: 'その他の質問',
    message_label: 'メッセージ',
    message_placeholder: 'お問い合わせ内容を詳しく入力してください（5〜1000文字）...',
    message_min_hint: '最小5文字、最大1000文字',
    sending: '送信中...',
    send_btn: 'リクエストを送信',
    submit_success: 'ヘルプリクエストが正常に送信されました！担当者がまもなく返信します。',
    my_requests_title: '私のヘルプリクエスト',
    no_requests: 'ヘルプリクエストはありません',
    no_requests_sub: 'まだヘルプリクエストを送信していません。',
    status_waiting: '返信待ち',
    status_replied: '返信済み',
    company_reply_title: '会社からの返信'
  }
);

// 3. Korean (ko)
updateLang(
  'ko',
  {
    askBrother: '여기서 Other/Brother에게 도움 요청하기',
    askBrotherShort: '도움 요청',
    help: '도움말 및 지원'
  },
  {
    new_here_register: '처음이신가요? 회원가입'
  },
  {
    upi_hint: '예시: mobilenumber@ybl',
    docs_subtitle: '정부 발행 신분증의 선명한 사진을 업로드하세요 (마스킹된 Aadhaar 가능)'
  },
  {
    title: '도움말 및 지원',
    subtitle: '청구, 풀 또는 계정과 관련하여 도움이 필요하신가요? 지원 팀에 문의를 남겨주세요.',
    form_title: '도움 요청 등록',
    category_label: '카테고리',
    category_select: '문의 카테고리를 선택하세요...',
    cat_claim: '보험 청구',
    cat_pool: '커뮤니티 풀 및 대출',
    cat_nearby: '동료 라이더 상호 지원',
    cat_account: '계정 및 프로필',
    cat_other: '기타 문의',
    message_label: '메시지',
    message_placeholder: '문의 내용을 자세히 입력해 주세요 (5자 이상 1000자 이하)...',
    message_min_hint: '최소 5자, 최대 1000자',
    sending: '제출 중...',
    send_btn: '문의 보내기',
    submit_success: '도움 요청이 성공적으로 접수되었습니다! 담당 팀에서 곧 답변을 드릴 예정입니다.',
    my_requests_title: '내 문의 내역',
    no_requests: '접수된 문의가 없습니다',
    no_requests_sub: '아직 등록하신 문의 내역이 없습니다.',
    status_waiting: '답변 대기 중',
    status_replied: '답변 완료',
    company_reply_title: '회사 답변'
  }
);

// 4. Simplified Chinese (zh-CN)
updateLang(
  'zh-CN',
  {
    askBrother: '在此向您的 Other/Brother 寻求帮助',
    askBrotherShort: '求助兄弟',
    help: '帮助与支持'
  },
  {
    new_here_register: '新用户？立即注册'
  },
  {
    upi_hint: '例如：mobilenumber@ybl',
    docs_subtitle: '请上传清晰的政府身份证件照片（遮盖部分号码的 Aadhaar 亦可）'
  },
  {
    title: '帮助与支持',
    subtitle: '需要理赔、互助资金池或账户方面的帮助？请向运营团队提交请求。',
    form_title: '提交帮助请求',
    category_label: '类别',
    category_select: '选择问题类别...',
    cat_claim: '保险理赔',
    cat_pool: '互助资金池与借款',
    cat_nearby: '同伴互助',
    cat_account: '账户与个人资料',
    cat_other: '其他问题',
    message_label: '详细留言',
    message_placeholder: '请详细描述您的问题（5 至 1000 个字符）...',
    message_min_hint: '最少 5 个字符，最多 1000 个字符',
    sending: '正在提交...',
    send_btn: '发送请求',
    submit_success: '帮助请求提交成功！我们的团队将尽快给予回复。',
    my_requests_title: '我的帮助请求',
    no_requests: '暂无帮助请求',
    no_requests_sub: '您尚未提交任何帮助请求。',
    status_waiting: '等待回复',
    status_replied: '已回复',
    company_reply_title: '企业答复'
  }
);
