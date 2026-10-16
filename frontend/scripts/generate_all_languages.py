# -*- coding: utf-8 -*-
import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
I18N_DIR = os.path.join(BASE_DIR, 'src', 'assets', 'i18n')
EN_PATH = os.path.join(I18N_DIR, 'en.json')

with open(EN_PATH, 'r', encoding='utf-8') as f:
    en_base = json.load(f)

LANGS = ['bn', 'ta', 'te', 'kn', 'mr', 'id', 'vi', 'th', 'fil', 'ms']

# Common terms across sections:
# Brand: "Other/Brother"
# Bonus note: "Thank-you bonus is a promise by the requester. The app does not enforce it."
# UPI note: "Payment happens in your UPI app. The app does not move money."

def get_translations_for(lang):
    t = json.loads(json.dumps(en_base)) # deep copy structure

    # 1. app & nav & register & wait & rejected & not_found
    if lang == 'bn': # Bengali
        t['app'] = {
            "title": "Other/Brother",
            "tagline": "যখন একজন অন্যজন হয়ে ওঠে ভাই।",
            "subtext": "ভারতের গিগ ও ডেলিভারি কর্মীদের জন্য এআই চালিত নিরাপত্তা ও ভ্রাতৃত্বের মেলবন্ধন।",
            "verified_network": "যাচাইকৃত কর্মী নেটওয়ার্ক",
            "emergency_helpline": "জরুরি হেল্পলাইন",
            "emergency_sub": "রাস্তায় কি তাৎক্ষণিক সাহায্য প্রয়োজন?",
            "emergency_sos": "এসওএস কল করুন (112)",
            "trust_score": "বিশ্বাসযোগ্যতা: {{score}}/100",
            "worker_profile": "কর্মী প্রোফাইল",
            "company_portal": "কোম্পানি পোর্টাল",
            "sign_out": "সাইন আউট"
        }
        t['nav'] = {
            "home": "হোম",
            "claims": "দাবি",
            "community": "কমিউনিটি পুল",
            "askBrother": "এখানে আপনার Other/Brother এর কাছে সাহায্য চান",
            "askBrotherShort": "সাহায্য চান",
            "nearby": "এখানে আপনার Other/Brother এর কাছে সাহায্য চান",
            "leaderboard": "লিডারবোর্ড",
            "trust": "বিশ্বাসযোগ্যতা স্কোর",
            "income": "আয় ও সরকারি সুবিধা",
            "profile": "প্রোফাইল",
            "help": "সাহায্য ও সহায়তা"
        }
        t['register'] = {
            "upi_hint": "উদাহরণ: mobilenumber@ybl",
            "docs_subtitle": "আপনার সরকারি পরিচয়পত্রের একটি পরিষ্কার ছবি আপলোড করুন (মাস্কড আধার গ্রহণযোগ্য)"
        }
        t['wait'] = {
            "title": "কোম্পানির অনুমোদনের জন্য অপেক্ষা করা হচ্ছে",
            "subtitle": "আপনার পার্টনার আইডি ও গাড়ির তথ্য পর্যালোচনার জন্য কোম্পানির ম্যানেজারের অপেক্ষায় রয়েছে।",
            "polling_status": "প্রতি ৫ সেকেন্ড পর পর অনুমোদনের স্ট্যাটাস পরীক্ষা করা হচ্ছে...",
            "request_ref": "অনুরোধ রেফারেন্স:",
            "worker_phone": "কর্মী ফোন নম্বর:",
            "check_now": "এখনই স্ট্যাটাস পরীক্ষা করুন",
            "switch_account": "অ্যাকাউন্ট পরিবর্তন / লগইনে ফিরুন"
        }
        t['rejected'] = {
            "title": "যাচাইকরণ অনুমোদিত হয়নি",
            "subtitle": "আপনার অ্যাকাউন্ট রেজিস্ট্রেশন ফ্লিট ম্যানেজার বা এআই দ্বারা অনুমোদিত হতে পারেনি।",
            "reason_label": "প্রত্যাখ্যানের কারণ:",
            "reasons_checklist": "সাধারণ কারণগুলির মধ্যে রয়েছে তথ্যের গরমিল বা অস্পষ্ট ছবি।",
            "try_again": "পুনরায় নিবন্ধন চেষ্টা করুন",
            "contact_support": "সাপোর্ট হেল্পলাইনে যোগাযোগ করুন",
            "back_login": "লগইনে ফিরুন"
        }
        t['support'] = {
            "title": "সাহায্য ও সহায়তা",
            "subtitle": "দাবি, পুল বা আপনার অ্যাকাউন্ট নিয়ে সাহায্য প্রয়োজন? আমাদের অপারেশন টিমের কাছে অনুরোধ জমা দিন।",
            "form_title": "সাহায্যের অনুরোধ জানান",
            "category_label": "বিভাগ",
            "category_select": "বিভাগ নির্বাচন করুন...",
            "cat_claim": "বীমা দাবি",
            "cat_pool": "কমিউনিটি পুল ও ঋণ",
            "cat_nearby": "সহকর্মী ভাইদের সাহায্য",
            "cat_account": "অ্যাকাউন্ট ও প্রোফাইল",
            "cat_other": "অন্যান্য প্রশ্ন",
            "message_label": "বার্তা",
            "message_placeholder": "দয়া করে আপনার সমস্যার বিশদ বিবরণ দিন (৫ থেকে ১০০০ অক্ষর)...",
            "message_min_hint": "সর্বনিম্ন ৫ অক্ষর, সর্বোচ্চ ১০০০ অক্ষর",
            "sending": "জমা দেওয়া হচ্ছে...",
            "send_btn": "অনুরোধ পাঠান",
            "submit_success": "সাহায্যের অনুরোধ সফলভাবে পাঠানো হয়েছে! আমাদের টিম শীঘ্রই উত্তর দেবে।",
            "my_requests_title": "আমার সাহায্যের অনুরোধসমূহ",
            "no_requests": "কোনো সাহায্যের অনুরোধ নেই",
            "no_requests_sub": "আপনি এখনও পর্যন্ত কোনো সাহায্যের অনুরোধ জমা দেননি।",
            "status_waiting": "উত্তরের অপেক্ষায়",
            "status_replied": "উত্তর দেওয়া হয়েছে",
            "company_reply_title": "কোম্পানির উত্তর"
        }

    elif lang == 'ta': # Tamil
        t['app'] = {
            "title": "Other/Brother",
            "tagline": "ஒருவர் தோழனாக மாறும் தருணம்.",
            "subtext": "இந்தியாவின் கிக் மற்றும் டெலிவரி தொழிலாளர்களுக்கான பாதுகாப்பு மற்றும் சமூக தோழமை தளம்.",
            "verified_network": "சரிபார்க்கப்பட்ட தொழிலாளர் நெட்வொர்க்",
            "emergency_helpline": "அவசர உதவி எண்",
            "emergency_sub": "சாலையில் உடனடி உதவி தேவையா?",
            "emergency_sos": "அவசர அழைப்பு (112)",
            "trust_score": "நம்பகத்தன்மை: {{score}}/100",
            "worker_profile": "தொழிலாளர் சுயவிவரம்",
            "company_portal": "நிறுவன போர்டல்",
            "sign_out": "வெளியேறு"
        }
        t['nav'] = {
            "home": "முகப்பு",
            "claims": "கோரிக்கைகள்",
            "community": "சமூக நிதி",
            "askBrother": "உங்கள் Other/Brother-இடம் இங்கே உதவி கேளுங்கள்",
            "askBrotherShort": "உதவி கேள்",
            "nearby": "உங்கள் Other/Brother-இடம் இங்கே உதவி கேளுங்கள்",
            "leaderboard": "முன்னணி பலகை",
            "trust": "நம்பகத்தன்மை மதிப்பெண்",
            "income": "வருமானம் & நலத்திட்டங்கள்",
            "profile": "சுயவிவரம்",
            "help": "உதவி & ஆதரவு"
        }
        t['register'] = {
            "upi_hint": "உதாரணம்: mobilenumber@ybl",
            "docs_subtitle": "உங்கள் அரசு அடையாள அட்டையின் தெளிவான புகைப்படத்தைப் பதிவேற்றவும் (மாஸ்க் செய்யப்பட்ட ஆதார் சரி)"
        }
        t['wait'] = {
            "title": "நிறுவன உறுதிப்படுத்தலுக்காக காத்திருக்கிறது",
            "subtitle": "உங்கள் நிறுவன மேலாளர் உங்கள் விவரங்களை சரிபார்க்க காத்திருக்கிறது.",
            "polling_status": "ஒவ்வொரு 5 வினாடிக்கும் ஒப்புதல் நிலை சரிபார்க்கப்படுகிறது...",
            "request_ref": "கோரிக்கை எண்:",
            "worker_phone": "தொழிலாளர் தொலைபேசி:",
            "check_now": "இப்போது நிலையைச் சரிபார்க்கவும்",
            "switch_account": "கணக்கை மாற்று / உள்நுழைவுக்குத் திரும்பு"
        }
        t['rejected'] = {
            "title": "சரிபார்ப்பு அங்கீகரிக்கப்படவில்லை",
            "subtitle": "உங்கள் கணக்கு பதிவு மேலாளரால் அங்கீகரிக்கப்படவில்லை.",
            "reason_label": "நிராகரிப்பு காரணம்:",
            "reasons_checklist": "தவறான ஐடி அல்லது தெளிவற்ற புகைப்படம் காரணமாக இருக்கலாம்.",
            "try_again": "மீண்டும் பதிவு செய்ய முயற்சிக்கவும்",
            "contact_support": "உதவி மையத்தைத் தொடர்பு கொள்ளவும்",
            "back_login": "உள்நுழைவுக்குத் திரும்பு"
        }
        t['support'] = {
            "title": "உதவி & ஆதரவு",
            "subtitle": "கோரிக்கைகள், நிதி அல்லது உங்கள் கணக்கு தொடர்பான உதவி தேவையா? எங்கள் குழுவிற்கு கோரிக்கையை சமர்ப்பிக்கவும்.",
            "form_title": "உதவி கோரிக்கையை அனுப்பவும்",
            "category_label": "வகை",
            "category_select": "வகையைத் தேர்ந்தெடுக்கவும்...",
            "cat_claim": "காப்பீட்டுக் கோரிக்கை",
            "cat_pool": "சமூக நிதி & கடன்கள்",
            "cat_nearby": "சக தோழர் உதவி",
            "cat_account": "கணக்கு & சுயவிவரம்",
            "cat_other": "இதர கேள்விகள்",
            "message_label": "செய்தி",
            "message_placeholder": "உங்கள் சிக்கலை விரிவாக விவரிக்கவும் (5 முதல் 1000 எழுத்துக்கள்)...",
            "message_min_hint": "குறைந்தது 5 எழுத்துக்கள், அதிகபட்சம் 1000 எழுத்துக்கள்",
            "sending": "சமர்ப்பிக்கிறது...",
            "send_btn": "கோரிக்கையை அனுப்பு",
            "submit_success": "உதவி கோரிக்கை வெற்றிகரமாக அனுப்பப்பட்டது! எங்கள் குழு விரைவில் பதிலளிக்கும்.",
            "my_requests_title": "எனது உதவி கோரிக்கைகள்",
            "no_requests": "உதவி கோரிக்கைகள் எதுவும் இல்லை",
            "no_requests_sub": "நீங்கள் இதுவரை எந்த உதவி கோரிக்கையையும் சமர்ப்பிக்கவில்லை.",
            "status_waiting": "பதிலுக்காக காத்திருக்கிறது",
            "status_replied": "பதிலளிக்கப்பட்டது",
            "company_reply_title": "நிறுவனத்தின் பதில்"
        }

    elif lang == 'te': # Telugu
        t['app'] = {
            "title": "Other/Brother",
            "tagline": "ఒక అపరిచితుడు సోదరుడిగా మారిన వేళ.",
            "subtext": "భారతీయ గిగ్ మరియు డెలివరీ వర్కర్ల కోసం AI ఆధారిత భద్రత మరియు సోదరభావ నెట్‌వర్క్.",
            "verified_network": "ధృవీకరించబడిన వర్కర్ నెట్‌వర్క్",
            "emergency_helpline": "అత్యవసర హెల్ప్‌లైన్",
            "emergency_sub": "రోడ్డుపై తక్షణ సహాయం కావాలా?",
            "emergency_sos": "SOS కాల్ చేయండి (112)",
            "trust_score": "నమ్మకం: {{score}}/100",
            "worker_profile": "వర్కర్ ప్రొఫైల్",
            "company_portal": "కంపెనీ పోర్టల్",
            "sign_out": "సైన్ అవుట్"
        }
        t['nav'] = {
            "home": "హోమ్",
            "claims": "క్లెయిమ్‌లు",
            "community": "కమ్యూనిటీ పూల్",
            "askBrother": "మీ Other/Brother ని ఇక్కడ సహాయం అడగండి",
            "askBrotherShort": "సహాయం అడుగు",
            "nearby": "మీ Other/Brother ని ఇక్కడ సహాయం అడగండి",
            "leaderboard": "లీడర్‌బోర్డ్",
            "trust": "ట్రస్ట్ స్కోర్",
            "income": "ఆదాయం & పథకాలు",
            "profile": "ప్రొఫైల్",
            "help": "సహాయం & మద్దతు"
        }
        t['register'] = {
            "upi_hint": "ఉదాహరణ: mobilenumber@ybl",
            "docs_subtitle": "మీ ప్రభుత్వ గుర్తింపు కార్డు యొక్క స్పష్టమైన ఫోటోను అప్‌లోడ్ చేయండి (మాస్క్ చేసిన ఆధార్ పర్వాలేదు)"
        }
        t['wait'] = {
            "title": "కంపెనీ నిర్ధారణ కోసం వేచి చూస్తున్నారు",
            "subtitle": "మీ కంపెనీ మేనేజర్ వివరాలను సమీక్షించడానికి వేచి ఉన్నారు.",
            "polling_status": "ప్రతి 5 సెకన్లకు ఆమోద స్థితి తనిఖీ చేయబడుతోంది...",
            "request_ref": "అభ్యర్థన రిఫరెన్స్:",
            "worker_phone": "వర్కర్ ఫోన్:",
            "check_now": "ఇప్పుడే స్థితిని తనిఖీ చేయండి",
            "switch_account": "ఖాతాను మార్చండి / లాగిన్‌కు తిరిగి వెళ్లండి"
        }
        t['rejected'] = {
            "title": "ధృవీకరణ ఆమోదించబడలేదు",
            "subtitle": "మీ రిజిస్ట్రేషన్ కంపెనీ మేనేజర్ ద్వారా ఆమోదించబడలేదు.",
            "reason_label": "తిరస్కరణ కారణం:",
            "reasons_checklist": "ఐడీ వివరాలు సరిపోలకపోవడం లేదా అస్పష్టమైన ఫోటోలు కావచ్చు.",
            "try_again": "మళ్ళీ ప్రయత్నించండి",
            "contact_support": "సపోర్ట్ హెల్ప్‌లైన్‌ను సంప్రదించండి",
            "back_login": "లాగిన్‌కు తిరిగి వెళ్లండి"
        }
        t['support'] = {
            "title": "సహాయం & మద్దతు",
            "subtitle": "క్లెయిమ్‌లు, పూల్ లేదా మీ ఖాతాకు సంబంధించి సహాయం కావాలా? మా బృందానికి అభ్యర్థనను పంపండి.",
            "form_title": "సహాయ అభ్యర్థనను సమర్పించండి",
            "category_label": "వర్గం",
            "category_select": "వర్గాన్ని ఎంచుకోండి...",
            "cat_claim": "భీమా క్లెయిమ్",
            "cat_pool": "కమ్యూనిటీ పూల్ & రుణాలు",
            "cat_nearby": "సహచర సోదరుల సహాయం",
            "cat_account": "ఖాతా & ప్రొఫైల్",
            "cat_other": "ఇతర ప్రశ్నలు",
            "message_label": "సందేశం",
            "message_placeholder": "దయచేసి మీ సమస్యను వివరంగా వివరించండి (5 నుండి 1000 అక్షరాలు)...",
            "message_min_hint": "కనీసం 5 అక్షరాలు, గరిష్టంగా 1000 అక్షరాలు",
            "sending": "సమర్పిస్తోంది...",
            "send_btn": "అభ్యర్థనను పంపండి",
            "submit_success": "సహాయ అభ్యర్థన విజయవంతంగా పంపబడింది! మా బృందం త్వరలో సమాధానమిస్తుంది.",
            "my_requests_title": "నా సహాయ అభ్యర్థనలు",
            "no_requests": "ఎలాంటి సహాయ అభ్యర్థనలు కనుగొనబడలేదు",
            "no_requests_sub": "మీరు ఇంకా ఎలాంటి సహాయ అభ్యర్థనలను సమర్పించలేదు.",
            "status_waiting": "సమాధానం కోసం వేచి ఉంది",
            "status_replied": "సమాధానం ఇవ్వబడింది",
            "company_reply_title": "కంపెనీ సమాధానం"
        }

    elif lang == 'kn': # Kannada
        t['app'] = {
            "title": "Other/Brother",
            "tagline": "ಒಬ್ಬ ಅಪರಿಚಿತನು ಸಹೋದರನಾಗುವ ಕ್ಷಣ.",
            "subtext": "ಭಾರತದ ಗಿಗ್ ಮತ್ತು ಡೆಲಿವರಿ ಕಾರ್ಮಿಕರಿಗಾಗಿ AI ಆಧಾರಿತ ಸುರಕ್ಷತೆ ಮತ್ತು ಸಮುದಾಯ ವೇದಿಕೆ.",
            "verified_network": "ಪರಿಶೀಲಿಸಿದ ಕಾರ್ಮಿಕರ ನೆಟ್‌ವರ್ಕ್",
            "emergency_helpline": "ತುರ್ತು ಸಹಾಯವಾಣಿ",
            "emergency_sub": "ರಸ್ತೆಯಲ್ಲಿ ತಕ್ಷಣದ ನೆರವು ಬೇಕೇ?",
            "emergency_sos": "SOS ಕರೆ ಮಾಡಿ (112)",
            "trust_score": "ವಿಶ್ವಾಸಾರ್ಹತೆ: {{score}}/100",
            "worker_profile": "ಕಾರ್ಮಿಕ ಪ್ರೊಫೈಲ್",
            "company_portal": "ಕಂಪನಿ ಪೋರ್ಟಲ್",
            "sign_out": "ಸೈನ್ ಔಟ್"
        }
        t['nav'] = {
            "home": "ಮುಖಪುಟ",
            "claims": "ಕ್ಲೈಮ್‌ಗಳು",
            "community": "ಸಮುದಾಯ ಪೂಲ್",
            "askBrother": "ನಿಮ್ಮ Other/Brother ಬಳಿ ಇಲ್ಲಿ ಸಹಾಯ ಕೇಳಿ",
            "askBrotherShort": "ಸಹಾಯ ಕೇಳಿ",
            "nearby": "ನಿಮ್ಮ Other/Brother ಬಳಿ ಇಲ್ಲಿ ಸಹಾಯ ಕೇಳಿ",
            "leaderboard": "ಲೀಡರ್‌ಬೋರ್ಡ್",
            "trust": "ವಿಶ್ವಾಸಾರ್ಹತೆಯ ಸ್ಕೋರ್",
            "income": "ಆದಾಯ & ಯೋಜನೆಗಳು",
            "profile": "ಪ್ರೊಫೈಲ್",
            "help": "ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ"
        }
        t['register'] = {
            "upi_hint": "ಉದಾಹರಣೆ: mobilenumber@ybl",
            "docs_subtitle": "ನಿಮ್ಮ ಸರ್ಕಾರಿ ಗುರುತಿನ ಚೀಟಿಯ ಸ್ಪಷ್ಟ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (ಮಾಸ್ಕ್ ಮಾಡಿದ ಆಧಾರ್ ಸಹ ಸರಿ)"
        }
        t['wait'] = {
            "title": "ಕಂಪನಿಯ ದೃಢೀಕರಣಕ್ಕಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ",
            "subtitle": "ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ಕಂಪನಿ ವ್ಯವಸ್ಥಾಪಕರಿಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ.",
            "polling_status": "ಪ್ರತಿ 5 ಸೆಕೆಂಡಿಗೆ ಅನುಮೋದನೆ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
            "request_ref": "ವಿನಂತಿ ಉಲ್ಲೇಖ:",
            "worker_phone": "ಕಾರ್ಮಿಕರ ಫೋನ್:",
            "check_now": "ಈಗಲೇ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ",
            "switch_account": "ಖಾತೆ ಬದಲಾಯಿಸಿ / ಲಾಗಿನ್‌ಗೆ ಹಿಂತಿರುಗಿ"
        }
        t['rejected'] = {
            "title": "ಪರಿಶೀಲನೆ ಅನುಮೋದನೆಗೊಂಡಿಲ್ಲ",
            "subtitle": "ನಿಮ್ಮ ಖಾತೆ ನೋಂದಣಿಯನ್ನು ಕಂಪನಿ ಮ್ಯಾನೇಜರ್ ಅನುಮೋದಿಸಿಲ್ಲ.",
            "reason_label": "ತಿರಸ್ಕಾರಕ್ಕೆ ಕಾರಣ:",
            "reasons_checklist": "ವಿವರಗಳು ಹೊಂದಿಕೆಯಾಗದಿರುವುದು ಅಥವಾ ಅಸ್ಪಷ್ಟ ದಾಖಲೆಗಳು ಕಾರಣವಾಗಿರಬಹುದು.",
            "try_again": "ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ",
            "contact_support": "ಬೆಂಬಲ ಸಹಾಯವಾಣಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ",
            "back_login": "ಲಾಗಿನ್‌ಗೆ ಹಿಂತಿರುಗಿ"
        }
        t['support'] = {
            "title": "ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ",
            "subtitle": "ಕ್ಲೈಮ್‌ಗಳು, ಪೂಲ್ ಅಥವಾ ನಿಮ್ಮ ಖಾತೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ಸಹಾಯ ಬೇಕೇ? ನಮ್ಮ ಕಾರ್ಯಾಚರಣೆ ತಂಡಕ್ಕೆ ವಿನಂತಿಯನ್ನು ಸಲ್ಲಿಸಿ.",
            "form_title": "ಸಹಾಯ ವಿನಂತಿಯನ್ನು ಸಲ್ಲಿಸಿ",
            "category_label": "ವರ್ಗ",
            "category_select": "ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ...",
            "cat_claim": "ವಿಮಾ ಕ್ಲೈಮ್",
            "cat_pool": "ಸಮುದಾಯ ಪೂಲ್ ಮತ್ತು ಸಾಲಗಳು",
            "cat_nearby": "ಸಹವರ್ತಿ ಸಹೋದರರ ನೆರವು",
            "cat_account": "ಖಾತೆ ಮತ್ತು ಪ್ರೊಫೈಲ್",
            "cat_other": "ಇತರ ಪ್ರಶ್ನೆಗಳು",
            "message_label": "ಸಂದೇಶ",
            "message_placeholder": "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ವಿವರವಾಗಿ ವಿವರಿಸಿ (5 ರಿಂದ 1000 ಅಕ್ಷರಗಳು)...",
            "message_min_hint": "ಕನಿಷ್ಠ 5 ಅಕ್ಷರಗಳು, ಗರಿಷ್ಠ 1000 ಅಕ್ಷರಗಳು",
            "sending": "ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...",
            "send_btn": "ವಿನಂತಿಯನ್ನು ಕಳುಹಿಸಿ",
            "submit_success": "ಸಹಾಯ ವಿನಂತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಕಳುಹಿಸಲಾಗಿದೆ! ನಮ್ಮ ತಂಡ ಶೀಘ್ರದಲ್ಲೇ ಪ್ರತಿಕ್ರಿಯಿಸಲಿದೆ.",
            "my_requests_title": "ನನ್ನ ಸಹಾಯ ವಿನಂತಿಗಳು",
            "no_requests": "ಯಾವುದೇ ಸಹಾಯ ವಿನಂತಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ",
            "no_requests_sub": "ನೀವು ಇನ್ನೂ ಯಾವುದೇ ಸಹಾಯ ವಿನಂತಿಗಳನ್ನು ಸಲ್ಲಿಸಿಲ್ಲ.",
            "status_waiting": "ಪ್ರತಿಕ್ರಿಯೆಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ",
            "status_replied": "ಪ್ರತಿಕ್ರಿಯಿಸಲಾಗಿದೆ",
            "company_reply_title": "ಕಂಪನಿಯ ಪ್ರತಿಕ್ರಿಯೆ"
        }

    elif lang == 'mr': # Marathi
        t['app'] = {
            "title": "Other/Brother",
            "tagline": "जेव्हा एक अनोळखी व्यक्ती भाऊ बनतो.",
            "subtext": "भारतातील गिग आणि डिलिव्हरी कामगारांसाठी AI समर्थित सुरक्षा आणि बंधুभाव नेटवर्क.",
            "verified_network": "सत्यापित कामगार नेटवर्क",
            "emergency_helpline": "तातडीची हेल्पलाइन",
            "emergency_sub": "रस्त्यावर तातडीने मदत हवी आहे का?",
            "emergency_sos": "SOS कॉल करा (112)",
            "trust_score": "विश्वास: {{score}}/100",
            "worker_profile": "कामगार प्रोफाइल",
            "company_portal": "कंपनी पोर्टल",
            "sign_out": "साइन आउट"
        }
        t['nav'] = {
            "home": "होम",
            "claims": "दावे",
            "community": "कम्युनिटी पूल",
            "askBrother": "येथे आपल्या Other/Brother कडून मदत मागा",
            "askBrotherShort": "मदत मागा",
            "nearby": "येथे आपल्या Other/Brother कडून मदत मागा",
            "leaderboard": "लीडरबोर्ड",
            "trust": "विश्वास गुण",
            "income": "उत्पन्न आणि योजना",
            "profile": "प्रोफाइल",
            "help": "मदत आणि सपोर्ट"
        }
        t['register'] = {
            "upi_hint": "उदाहरण: mobilenumber@ybl",
            "docs_subtitle": "आपल्या सरकारी ओळखपत्राचा स्पष्ट फोटो अपलोड करा (मास्क्ड आधार चालेल)"
        }
        t['wait'] = {
            "title": "कंपनीच्या पुष्टीकरणाची प्रतीक्षा करत आहे",
            "subtitle": "कंपनी व्यवस्थापकाद्वारे आपल्या माहितीची पडताळणी प्रलंबित आहे.",
            "polling_status": "दर ५ सेकंदांनी मंजुरी स्थिती तपासली जात आहे...",
            "request_ref": "विनंती संदर्भ:",
            "worker_phone": "कामगार फोन:",
            "check_now": "आता स्थिती तपासा",
            "switch_account": "खाते बदला / लॉगिनकडे परत जा"
        }
        t['rejected'] = {
            "title": "सत्यापन मंजूर झाले नाही",
            "subtitle": "आपली नोंदणी कंपनी मॅनेजरद्वारे मंजूर केली गेली नाही.",
            "reason_label": "नाकारण्याचे कारण:",
            "reasons_checklist": "माहिती जुळत नसल्यामुळे किंवा अस्पष्ट कागदपत्रांमुळे हे घडू शकते.",
            "try_again": "पुन्हा प्रयत्न करा",
            "contact_support": "सपोर्ट हेल्पलाइनशी संपर्क साधा",
            "back_login": "लॉगिनकडे परत जा"
        }
        t['support'] = {
            "title": "मदत आणि सपोर्ट",
            "subtitle": "दावे, पूल किंवा आपल्या खात्याबद्दल मदत हवी आहे? आमच्या टीमला विनंती पाठवा.",
            "form_title": "मदत विनंती सादर करा",
            "category_label": "वर्गवारी",
            "category_select": "वर्गवारी निवडा...",
            "cat_claim": "विमा दावा",
            "cat_pool": "कम्युनिटी पूल आणि कर्ज",
            "cat_nearby": "सहकारी बांधवांची मदत",
            "cat_account": "खाते आणि प्रोफाइल",
            "cat_other": "इतर प्रश्न",
            "message_label": "संदेश",
            "message_placeholder": "कृपया आपली समस्या सविस्तर लिहा (५ ते १००० अक्षरे)...",
            "message_min_hint": "किमान ५ अक्षरे, कमाल १००० अक्षरे",
            "sending": "पाठवत आहे...",
            "send_btn": "विनंती पाठवा",
            "submit_success": "मदत विनंती यशस्वीरीत्या पाठवली गेली! आमची टीम लवकरच प्रतिसाद देईल.",
            "my_requests_title": "माझ्या मदत विनंत्या",
            "no_requests": "कोणतीही मदत विनंती आढळली नाही",
            "no_requests_sub": "तुम्ही अद्याप कोणतीही मदत विनंती पाठवलेली नाही.",
            "status_waiting": "उत्तराची प्रतीक्षा आहे",
            "status_replied": "उत्तर दिले आहे",
            "company_reply_title": "कंपनीचे उत्तर"
        }

    elif lang == 'id': # Indonesian
        t['app'] = {
            "title": "Other/Brother",
            "tagline": "Ketika orang asing menjadi saudara.",
            "subtext": "Jaring pengaman berbasis AI dan persaudaraan komunitas untuk pekerja gig dan pengemudi.",
            "verified_network": "Jaringan Pekerja Terverifikasi",
            "emergency_helpline": "Saluran Bantuan Darurat",
            "emergency_sub": "Butuh bantuan mendesak di jalan?",
            "emergency_sos": "Panggil SOS (112)",
            "trust_score": "Kepercayaan: {{score}}/100",
            "worker_profile": "Profil Pekerja",
            "company_portal": "Portal Perusahaan",
            "sign_out": "Keluar"
        }
        t['nav'] = {
            "home": "Beranda",
            "claims": "Klaim",
            "community": "Pool Komunitas",
            "askBrother": "Minta Bantuan Other/Brother di Sini",
            "askBrotherShort": "Tanya Saudara",
            "nearby": "Minta Bantuan Other/Brother di Sini",
            "leaderboard": "Peringkat",
            "trust": "Skor Kepercayaan",
            "income": "Pendapatan & Skema",
            "profile": "Profil",
            "help": "Bantuan & Dukungan"
        }
        t['register'] = {
            "upi_hint": "Contoh: mobilenumber@ybl",
            "docs_subtitle": "Unggah foto jelas Kartu Identitas Resmi Anda (Aadhaar tersamar diperbolehkan)"
        }
        t['wait'] = {
            "title": "Menunggu Konfirmasi Perusahaan",
            "subtitle": "Menunggu manajer perusahaan meninjau dan mengonfirmasi detail kemitraan Anda.",
            "polling_status": "Memeriksa status persetujuan setiap 5 detik...",
            "request_ref": "Referensi Permintaan:",
            "worker_phone": "Nomor Telepon Pekerja:",
            "check_now": "Periksa Status Sekarang",
            "switch_account": "Ganti Akun / Kembali ke Masuk"
        }
        t['rejected'] = {
            "title": "Verifikasi Belum Disetujui",
            "subtitle": "Pendaftaran akun Anda tidak dapat diverifikasi oleh manajer armada.",
            "reason_label": "Alasan Penolakan:",
            "reasons_checklist": "Alasan umum mencakup ketidakcocokan ID mitra atau foto dokumen buram.",
            "try_again": "Coba Pendaftaran Lagi",
            "contact_support": "Hubungi Bantuan Dukungan",
            "back_login": "Kembali ke Masuk"
        }
        t['support'] = {
            "title": "Bantuan & Dukungan",
            "subtitle": "Butuh bantuan klaim, pool darurat, atau akun Anda? Kirim permintaan ke tim kami.",
            "form_title": "Kirim Permintaan Bantuan",
            "category_label": "Kategori",
            "category_select": "Pilih kategori pertanyaan...",
            "cat_claim": "Klaim Asuransi",
            "cat_pool": "Pool Komunitas & Pinjaman",
            "cat_nearby": "Bantuan Sesama Rekan",
            "cat_account": "Akun & Profil",
            "cat_other": "Pertanyaan Lainnya",
            "message_label": "Pesan",
            "message_placeholder": "Jelaskan kendala Anda secara rinci (5 hingga 1000 karakter)...",
            "message_min_hint": "Minimal 5 karakter, maksimal 1000 karakter",
            "sending": "Mengirimkan...",
            "send_btn": "Kirim Permintaan",
            "submit_success": "Permintaan bantuan berhasil dikirim! Tim kami akan segera membalas.",
            "my_requests_title": "Permintaan Bantuan Saya",
            "no_requests": "Tidak ada permintaan bantuan",
            "no_requests_sub": "Anda belum pernah mengirimkan permintaan bantuan apa pun.",
            "status_waiting": "Menunggu balasan",
            "status_replied": "Dibalas",
            "company_reply_title": "Balasan Perusahaan"
        }

    elif lang == 'vi': # Vietnamese
        t['app'] = {
            "title": "Other/Brother",
            "tagline": "Khi người xa lạ trở thành anh em.",
            "subtext": "Mạng lưới an toàn và cộng đồng tương trợ thông minh cho tài xế công nghệ và nhân viên giao hàng.",
            "verified_network": "Mạng lưới đối tác đã xác minh",
            "emergency_helpline": "Đường dây nóng khẩn cấp",
            "emergency_sub": "Cần hỗ trợ khẩn cấp trên đường?",
            "emergency_sos": "Gọi SOS (112)",
            "trust_score": "Độ tin cậy: {{score}}/100",
            "worker_profile": "Hồ sơ đối tác",
            "company_portal": "Cổng thông tin công ty",
            "sign_out": "Đăng xuất"
        }
        t['nav'] = {
            "home": "Trang chủ",
            "claims": "Bồi thường",
            "community": "Quỹ cộng đồng",
            "askBrother": "Yêu cầu Other/Brother giúp đỡ tại đây",
            "askBrotherShort": "Hỏi anh em",
            "nearby": "Yêu cầu Other/Brother giúp đỡ tại đây",
            "leaderboard": "Bảng xếp hạng",
            "trust": "Điểm tin cậy",
            "income": "Thu nhập & Chính sách",
            "profile": "Cá nhân",
            "help": "Trợ giúp & Hỗ trợ"
        }
        t['register'] = {
            "upi_hint": "Ví dụ: mobilenumber@ybl",
            "docs_subtitle": "Tải lên ảnh chụp rõ nét Giấy tờ tùy thân của chính phủ (Aadhaar che mờ vẫn được chấp nhận)"
        }
        t['wait'] = {
            "title": "Đang chờ công ty xác nhận",
            "subtitle": "Đang chờ quản lý đội xe xem xét và xác nhận thông tin đăng ký của bạn.",
            "polling_status": "Kiểm tra trạng thái phê duyệt sau mỗi 5 giây...",
            "request_ref": "Mã yêu cầu:",
            "worker_phone": "Số điện thoại:",
            "check_now": "Kiểm tra ngay",
            "switch_account": "Đổi tài khoản / Về trang đăng nhập"
        }
        t['rejected'] = {
            "title": "Xác minh không thành công",
            "subtitle": "Đăng ký tài khoản của bạn chưa được phê duyệt.",
            "reason_label": "Lý do từ chối:",
            "reasons_checklist": "Lý do phổ biến gồm sai lệch thông tin hoặc ảnh giấy tờ bị mờ.",
            "try_again": "Thử đăng ký lại",
            "contact_support": "Liên hệ hỗ trợ",
            "back_login": "Về đăng nhập"
        }
        t['support'] = {
            "title": "Trợ giúp & Hỗ trợ",
            "subtitle": "Cần trợ giúp về khiếu nại, quỹ cộng đồng hoặc tài khoản? Gửi yêu cầu cho nhóm hỗ trợ.",
            "form_title": "Gửi yêu cầu trợ giúp",
            "category_label": "Danh mục",
            "category_select": "Chọn danh mục yêu cầu...",
            "cat_claim": "Yêu cầu bồi thường bảo hiểm",
            "cat_pool": "Quỹ cộng đồng & Khoản vay",
            "cat_nearby": "Giúp đỡ giữa các đồng nghiệp",
            "cat_account": "Tài khoản & Hồ sơ",
            "cat_other": "Câu hỏi khác",
            "message_label": "Nội dung tin nhắn",
            "message_placeholder": "Vui lòng mô tả chi tiết vấn đề của bạn (5 đến 1000 ký tự)...",
            "message_min_hint": "Tối thiểu 5 ký tự, tối đa 1000 ký tự",
            "sending": "Đang gửi...",
            "send_btn": "Gửi yêu cầu",
            "submit_success": "Yêu cầu trợ giúp đã được gửi thành công! Nhóm chúng tôi sẽ phản hồi sớm.",
            "my_requests_title": "Yêu cầu trợ giúp của tôi",
            "no_requests": "Chưa có yêu cầu trợ giúp nào",
            "no_requests_sub": "Bạn chưa gửi bất kỳ yêu cầu trợ giúp nào.",
            "status_waiting": "Đang chờ phản hồi",
            "status_replied": "Đã phản hồi",
            "company_reply_title": "Phản hồi từ công ty"
        }

    elif lang == 'th': # Thai
        t['app'] = {
            "title": "Other/Brother",
            "tagline": "เมื่อคนอื่นกลายมาเป็นพี่น้อง.",
            "subtext": "ตาข่ายความปลอดภัยและเครือข่ายพี่น้องชุมชนสำหรับไรเดอร์และแรงงานกิ๊กในอินเดีย.",
            "verified_network": "เครือข่ายแรงงานที่ได้รับการยืนยัน",
            "emergency_helpline": "สายด่วนฉุกเฉิน",
            "emergency_sub": "ต้องการความช่วยเหลือเร่งด่วนบนท้องถนน?",
            "emergency_sos": "โทรฉุกเฉิน (112)",
            "trust_score": "ความน่าเชื่อถือ: {{score}}/100",
            "worker_profile": "โปรไฟล์ไรเดอร์",
            "company_portal": "พอร์ทัลบริษัท",
            "sign_out": "ออกจากระบบ"
        }
        t['nav'] = {
            "home": "หน้าแรก",
            "claims": "เคลม",
            "community": "กองทุนชุมชน",
            "askBrother": "ขอความช่วยเหลือจาก Other/Brother ที่นี่",
            "askBrotherShort": "ขอความช่วยเหลือ",
            "nearby": "ขอความช่วยเหลือจาก Other/Brother ที่นี่",
            "leaderboard": "อันดับผู้นำ",
            "trust": "คะแนนความน่าเชื่อถือ",
            "income": "รายได้และสวัสดิการ",
            "profile": "โปรไฟล์",
            "help": "ความช่วยเหลือและการสนับสนุน"
        }
        t['register'] = {
            "upi_hint": "ตัวอย่าง: mobilenumber@ybl",
            "docs_subtitle": "อัปโหลดรูปถ่ายบัตรประจำตัวประชาชนที่ชัดเจน (Aadhaar ที่ปิดบังข้อมูลบางส่วนสามารถใช้ได้)"
        }
        t['wait'] = {
            "title": "กำลังรอการยืนยันจากบริษัท",
            "subtitle": "กำลังรอให้ผู้จัดการบริษัทตรวจสอบและยืนยันข้อมูลของคุณ.",
            "polling_status": "ตรวจสอบสถานะการอนุมัติทุก 5 วินาที...",
            "request_ref": "เลขอ้างอิงคำขอ:",
            "worker_phone": "เบอร์โทรศัพท์:",
            "check_now": "ตรวจสอบสถานะตอนนี้",
            "switch_account": "เปลี่ยนบัญชี / กลับไปหน้าเข้าสู่ระบบ"
        }
        t['rejected'] = {
            "title": "การยืนยันไม่ได้รับการอนุมัติ",
            "subtitle": "การลงทะเบียนบัญชีของคุณไม่ได้รับการอนุมัติจากผู้จัดการ.",
            "reason_label": "เหตุผลที่ปฏิเสธ:",
            "reasons_checklist": "สาเหตุทั่วไปได้แก่ ข้อมูลไม่ตรงกัน หรือภาพถ่ายเอกสารไม่ชัดเจน.",
            "try_again": "ลองลงทะเบียนใหม่อีกครั้ง",
            "contact_support": "ติดต่อสายด่วนสนับสนุน",
            "back_login": "กลับไปหน้าเข้าสู่ระบบ"
        }
        t['support'] = {
            "title": "ความช่วยเหลือและการสนับสนุน",
            "subtitle": "ต้องการความช่วยเหลือเกี่ยวกับการเคลม เงินกองทุน หรือบัญชีของคุณ? ส่งคำขอไปยังทีมงานของเรา",
            "form_title": "ส่งคำขอความช่วยเหลือ",
            "category_label": "หมวดหมู่",
            "category_select": "เลือกหมวดหมู่คำถาม...",
            "cat_claim": "เคลมประกันภัย",
            "cat_pool": "กองทุนชุมชนและเงินกู้ยืม",
            "cat_nearby": "ความช่วยเหลือระหว่างเพื่อนร่วมงาน",
            "cat_account": "บัญชีและโปรไฟล์",
            "cat_other": "คำถามอื่นๆ",
            "message_label": "ข้อความ",
            "message_placeholder": "โปรดอธิบายปัญหาของคุณโดยละเอียด (5 ถึง 1000 ตัวอักษร)...",
            "message_min_hint": "ขั้นต่ำ 5 ตัวอักษร สูงสุด 1000 ตัวอักษร",
            "sending": "กำลังส่ง...",
            "send_btn": "ส่งคำขอ",
            "submit_success": "ส่งคำขอความช่วยเหลือเรียบร้อยแล้ว! ทีมงานของเราจะตอบกลับในไม่ช้า",
            "my_requests_title": "คำขอความช่วยเหลือของฉัน",
            "no_requests": "ไม่พบคำขอความช่วยเหลือ",
            "no_requests_sub": "คุณยังไม่ได้ส่งคำขอความช่วยเหลือใดๆ",
            "status_waiting": "กำลังรอคำตอบ",
            "status_replied": "ตอบกลับแล้ว",
            "company_reply_title": "คำตอบจากบริษัท"
        }

    elif lang == 'fil': # Filipino
        t['app'] = {
            "title": "Other/Brother",
            "tagline": "Kapag ang Iba ay naging Kapatid.",
            "subtext": "AI-powered safety net at komunidad ng magkakapatid para sa mga gig at delivery worker sa India.",
            "verified_network": "Na-verify na Network ng mga Manggagawa",
            "emergency_helpline": "Emergency Helpline",
            "emergency_sub": "Kailangan ng agarang tulong sa kalsada?",
            "emergency_sos": "Tumawag sa SOS (112)",
            "trust_score": "Tiwala: {{score}}/100",
            "worker_profile": "Profile ng Manggagawa",
            "company_portal": "Portal ng Kumpanya",
            "sign_out": "Mag-sign Out"
        }
        t['nav'] = {
            "home": "Home",
            "claims": "Mga Claim",
            "community": "Community Pool",
            "askBrother": "Humingi ng Tulong sa Iyong Other/Brother Dito",
            "askBrotherShort": "Magpatulong",
            "nearby": "Humingi ng Tulong sa Iyong Other/Brother Dito",
            "leaderboard": "Leaderboard",
            "trust": "Trust Score",
            "income": "Kita at Programa",
            "profile": "Profile",
            "help": "Tulong at Suporta"
        }
        t['register'] = {
            "upi_hint": "Halimbawa: mobilenumber@ybl",
            "docs_subtitle": "Mag-upload ng malinaw na larawan ng iyong Government ID (ayos lang ang masked Aadhaar)"
        }
        t['wait'] = {
            "title": "Naghihintay ng Kumpirmasyon ng Kumpanya",
            "subtitle": "Naghihintay na suriin at kumpirmahin ng iyong fleet manager ang iyong mga detalye.",
            "polling_status": "Sinusuri ang katayuan bawat 5 segundo...",
            "request_ref": "Sanggunian ng Kahilingan:",
            "worker_phone": "Telepono ng Manggagawa:",
            "check_now": "Suriin ang Katayuan Ngayon",
            "switch_account": "Lumipat ng Account / Bumalik sa Login"
        }
        t['rejected'] = {
            "title": "Hindi Naaprubahan ang Pag-verify",
            "subtitle": "Hindi ma-verify ng manager ang pagpaparehistro ng iyong account.",
            "reason_label": "Dahilan ng Pagtanggi:",
            "reasons_checklist": "Karaniwang dahilan ay hindi tugmang partner ID o malabong larawan.",
            "try_again": "Subukang Magparehistro Ulit",
            "contact_support": "Makipag-ugnayan sa Support Helpline",
            "back_login": "Bumalik sa Login"
        }
        t['support'] = {
            "title": "Tulong at Suporta",
            "subtitle": "Kailangan ng tulong sa mga claim, pool, o account? Magsumite ng kahilingan sa aming team.",
            "form_title": "Magsumite ng Kahilingan sa Tulong",
            "category_label": "Kategorya",
            "category_select": "Pumili ng kategorya...",
            "cat_claim": "Claim sa Seguro",
            "cat_pool": "Community Pool at Pautang",
            "cat_nearby": "Tulong mula sa Kasamahan",
            "cat_account": "Account at Profile",
            "cat_other": "Iba pang Tanong",
            "message_label": "Mensahe",
            "message_placeholder": "Pakilarawan nang detalyado ang iyong problema (5 hanggang 1000 character)...",
            "message_min_hint": "Minimum 5 character, maximum 1000 character",
            "sending": "Isinusumite...",
            "send_btn": "Ipadala ang Kahilingan",
            "submit_success": "Matagumpay na naipadala ang kahilingan sa tulong! Sasagot ang aming team sa lalong madaling panahon.",
            "my_requests_title": "Aking mga Kahilingan sa Tulong",
            "no_requests": "Walang nahanap na kahilingan sa tulong",
            "no_requests_sub": "Hindi ka pa nagsumite ng anumang kahilingan sa tulong.",
            "status_waiting": "Naghihintay ng sagot",
            "status_replied": "Nasagot na",
            "company_reply_title": "Sagot ng Kumpanya"
        }

    elif lang == 'ms': # Malay
        t['app'] = {
            "title": "Other/Brother",
            "tagline": "Apabila orang lain menjadi saudara.",
            "subtext": "Jaringan keselamatan berkuasa AI dan persaudaraan komuniti untuk pekerja gig dan penghantar.",
            "verified_network": "Rangkaian Pekerja Sah",
            "emergency_helpline": "Talian Bantuan Kecemasan",
            "emergency_sub": "Perlukan bantuan segera di jalan raya?",
            "emergency_sos": "Panggil SOS (112)",
            "trust_score": "Kepercayaan: {{score}}/100",
            "worker_profile": "Profil Pekerja",
            "company_portal": "Portal Syarikat",
            "sign_out": "Log Keluar"
        }
        t['nav'] = {
            "home": "Laman Utama",
            "claims": "Tuntutan",
            "community": "Kumpulan Komuniti",
            "askBrother": "Minta Bantuan Other/Brother di Sini",
            "askBrotherShort": "Tanya Saudara",
            "nearby": "Minta Bantuan Other/Brother di Sini",
            "leaderboard": "Papan Pendahulu",
            "trust": "Skor Kepercayaan",
            "income": "Pendapatan & Skim",
            "profile": "Profil",
            "help": "Bantuan & Sokongan"
        }
        t['register'] = {
            "upi_hint": "Contoh: mobilenumber@ybl",
            "docs_subtitle": "Muat naik foto jelas Kad Pengenalan Kerajaan anda (Aadhaar terlindung dibenarkan)"
        }
        t['wait'] = {
            "title": "Menunggu Pengesahan Syarikat",
            "subtitle": "Menunggu pengurus syarikat menyemak dan mengesahkan butiran rakan kongsi anda.",
            "polling_status": "Menyemak status kelulusan setiap 5 saat...",
            "request_ref": "Rujukan Permintaan:",
            "worker_phone": "Telefon Pekerja:",
            "check_now": "Semak Status Sekarang",
            "switch_account": "Tukar Akaun / Kembali ke Log Masuk"
        }
        t['rejected'] = {
            "title": "Pengesahan Tidak Diluluskan",
            "subtitle": "Pendaftaran akaun anda tidak dapat disahkan oleh pengurus armada.",
            "reason_label": "Sebab Penolakan:",
            "reasons_checklist": "Sebab biasa termasuk ketidakpadanan ID rakan kongsi atau foto kabur.",
            "try_again": "Cuba Pendaftaran Semula",
            "contact_support": "Hubungi Talian Bantuan Sokongan",
            "back_login": "Kembali ke Log Masuk"
        }
        t['support'] = {
            "title": "Bantuan & Sokongan",
            "subtitle": "Perlukan bantuan mengenai tuntutan, dana kecemasan, atau akaun anda? Hantar permintaan kepada pasukan kami.",
            "form_title": "Hantar Permintaan Bantuan",
            "category_label": "Kategori",
            "category_select": "Pilih kategori soalan...",
            "cat_claim": "Tuntutan Insurans",
            "cat_pool": "Kumpulan Komuniti & Pinjaman",
            "cat_nearby": "Bantuan Rakan Sekerja",
            "cat_account": "Akaun & Profil",
            "cat_other": "Pertanyaan Lain",
            "message_label": "Mesej",
            "message_placeholder": "Sila terangkan masalah anda secara terperinci (5 hingga 1000 aksara)...",
            "message_min_hint": "Minimum 5 aksara, maksimum 1000 aksara",
            "sending": "Menghantar...",
            "send_btn": "Hantar Permintaan",
            "submit_success": "Permintaan bantuan berjaya dihantar! Pasukan kami akan membalas tidak lama lagi.",
            "my_requests_title": "Permintaan Bantuan Saya",
            "no_requests": "Tiada permintaan bantuan dijumpai",
            "no_requests_sub": "Anda belum menghantar sebarang permintaan bantuan lagi.",
            "status_waiting": "Menunggu balasan",
            "status_replied": "Dibalas",
            "company_reply_title": "Balasan Syarikat"
        }

    # Ensure required wording rule notes in peer:
    # "Thank-you bonus is a promise by the requester. The app does not enforce it."
    # "Payment happens in your UPI app. The app does not move money."
    bonus_disclaimers = {
        'bn': "থ্যাঙ্ক-ইউ বোনাস হলো অনুরোধকারীর একটি প্রতিশ্রুতি। অ্যাপ এটি বাধ্যতামূলক করে না।",
        'ta': "நன்றி போனஸ் என்பது கோருபவரின் உறுதிமொழி. செயலி இதை கட்டாயப்படுத்தாது.",
        'te': "థాంక్-యు బోనస్ అనేది అభ్యర్థించిన వారి వాగ్దానం. యాప్ దీనిని అమలు చేయదు.",
        'kn': "ಧನ್ಯವಾದ ಬೋನಸ್ ಎನ್ನುವುದು ವಿನಂತಿದಾರರ ಭರವಸೆಯಾಗಿದೆ. ಅಪ್ಲಿಕೇಶನ್ ಇದನ್ನು ಜಾರಿಗೊಳಿಸುವುದಿಲ್ಲ.",
        'mr': "थँक-यू बोनस हे विनंतीकर्त्याचे वचन आहे. ॲप ते सक्तीने लागू करत नाही.",
        'id': "Bonus terima kasih adalah janji oleh pemohon. Aplikasi tidak memaksakannya.",
        'vi': "Tiền thưởng cảm ơn là lời hứa của người yêu cầu. Ứng dụng không bắt buộc điều này.",
        'th': "โบนัสขอบคุณเป็นสัญญาจากผู้ร้องขอ แอปไม่ได้บังคับใช้สิ่งนี้",
        'fil': "Ang thank-you bonus ay pangako ng humihiling. Hindi ito ipinapatupad ng app.",
        'ms': "Bonus terima kasih adalah janji oleh pemohon. Aplikasi tidak menguatkuasakannya."
    }
    payment_disclaimers = {
        'bn': "পেমেন্ট আপনার UPI অ্যাপে সম্পন্ন হয়। অ্যাপ টাকা স্থানান্তর করে না।",
        'ta': "பணம் செலுத்துதல் உங்கள் UPI செயலியில் நடக்கும். செயலி பணத்தை நகர்த்தாது.",
        'te': "చెల్లింపు మీ UPI యాప్‌లో జరుగుతుంది. యాప్ డబ్బును బదిలీ చేయదు.",
        'kn': "ಪಾವತಿಯು ನಿಮ್ಮ UPI ಅಪ್ಲಿಕೇಶನ್‌ನಲ್ಲಿ ನಡೆಯುತ್ತದೆ. ಅಪ್ಲಿಕೇಶನ್ ಹಣವನ್ನು ವರ್ಗಾಯಿಸುವುದಿಲ್ಲ.",
        'mr': "पेमेंट तुमच्या UPI ॲपमध्ये होते. ॲप पैसे ट्रान्सफर करत नाही.",
        'id': "Pembayaran dilakukan di aplikasi UPI Anda. Aplikasi ini tidak memindahkan uang.",
        'vi': "Thanh toán diễn ra trong ứng dụng UPI của bạn. Ứng dụng không thực hiện chuyển tiền.",
        'th': "การชำระเงินเกิดขึ้นในแอป UPI ของคุณ แอปไม่ได้ทำธุรกรรมย้ายเงิน",
        'fil': "Nagaganap ang pagbabayad sa iyong UPI app. Hindi naglilipat ng pera ang app.",
        'ms': "Pembayaran berlaku dalam aplikasi UPI anda. Aplikasi tidak memindahkan wang."
    }

    if 'peer' in t:
        if lang in bonus_disclaimers:
            t['peer']['bonus_disclaimer'] = bonus_disclaimers[lang]
        if lang in payment_disclaimers:
            t['peer']['payment_disclaimer'] = payment_disclaimers[lang]

    # Clean obsolete keys if copied from base
    if 'wait' in t:
        t['wait'].pop('tip_header', None)
        t['wait'].pop('tip_desc', None)
        t['wait'].pop('open_portal', None)
    if 'community' in t:
        t['community'].pop('tabs_nearby', None)
    if 'peer' in t:
        t['peer'].pop('tabs_nearby', None)
        t['peer'].pop('tabs_pool', None)

    return t

for lang in LANGS:
    target_path = os.path.join(I18N_DIR, f"{lang}.json")
    translated_data = get_translations_for(lang)
    with open(target_path, 'w', encoding='utf-8') as f:
        json.dump(translated_data, f, ensure_ascii=False, indent=2)
    print(f"Generated {lang}.json")

print("\nDone generating all 10 language files!")
