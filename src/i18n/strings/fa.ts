/**
 * Persian (Farsi) UI strings — RTL language.
 */
import type { UIStrings } from './en';

const fa: UIStrings = {
  startLesson: 'شروع جلسه',
  endLesson: 'پایان جلسه',
  endLessonNow: 'پایان جلسه همین الان',
  resumeLesson: 'ادامه به هر حال',
  retryMessage: 'تلاش مجدد',

  addStudent: 'افزودن دانش‌آموز',
  editStudent: 'ویرایش دانش‌آموز',
  deleteStudent: 'حذف دانش‌آموز',
  saveStudent: 'ذخیره دانش‌آموز',
  cancelEdit: 'انصراف',
  confirmDeleteStudent: 'آیا مطمئنید که می‌خواهید این دانش‌آموز و تمام تاریخچه جلسات او را حذف کنید؟',

  studentName: 'نام',
  studentAge: 'سن',
  languageLevel: 'سطح زبان',
  goals: 'اهداف',
  strengths: 'نقاط قوت',
  weaknesses: 'نقاط ضعف',
  ageGroupLabel: 'گروه سنی',

  canReadWriteSource: 'می‌تواند در زبان مادری بخواند و بنویسد',
  canReadWriteTarget: 'می‌تواند در زبان هدف بخواند و بنویسد',
  noticeSourceVoiceOnly: 'توضیحات کوتاه و شفاهی خواهند بود (بدون متن طولانی نوشتاری).',
  noticeNoReadWrite: 'جلسات درک مطلب و تمرین نوشتاری برای این دانش‌آموز غیرفعال هستند.',

  createStudentFirst: 'لطفاً ابتدا یک دانش‌آموز اضافه کنید.',
  noStudentsYet: 'هنوز دانش‌آموزی ثبت نشده. روی «افزودن دانش‌آموز» کلیک کنید.',
  noLessonsYet: 'هنوز جلسه‌ای ثبت نشده.',

  tabLesson: 'جلسه',
  tabStudents: 'دانش‌آموزان',
  tabHistory: 'تاریخچه',
  tabData: 'داده',

  lessonHistory: 'تاریخچه جلسات',

  sessionType: 'نوع جلسه',
  selectStudent: 'انتخاب دانش‌آموز',
  lessonHint: 'پس از شروع، در همین پنجره با معلم گفتگو کنید.',

  voiceConversation: 'مکالمه صوتی',
  conversationPractice: 'تمرین مکالمه',
  grammarLesson: 'درس گرامر',
  readingComprehension: 'درک مطلب',
  writingPractice: 'تمرین نوشتن',
  mixedLesson: 'جلسه ترکیبی',

  beginner: 'مبتدی',
  elementary: 'ابتدایی',
  preIntermediate: 'پیش‌متوسط',
  intermediate: 'متوسط',
  upperIntermediate: 'بالای متوسط',
  advanced: 'پیشرفته',

  exportData: 'خروجی داده',
  importData: 'وارد کردن داده',
  storageUsage: 'مصرف حافظه',
  storageWarning: 'هشدار: حافظه بیش از ۸۰٪ پر شده. پشتیبان‌گیری و پاک‌سازی را در نظر بگیرید.',
  importMergeWarning: 'وارد کردن داده: دانش‌آموزان موجود به‌روز می‌شوند، جدیدها اضافه می‌شوند و تنظیمات جایگزین می‌شوند. این عمل قابل بازگشت نیست.',
  importSuccess: 'ورود داده موفق!',
  importInvalidJson: 'خطا: فایل JSON معتبر نیست.',
  importInvalidStructure: 'خطا: ساختار فایل با فرمت پشتیبان مطابقت ندارد.',

  editSettings: 'ویرایش تنظیمات',
  saveSettings: 'ذخیره تنظیمات',
  memoryDepth: 'عمق حافظه (تعداد جلسات برای به‌یادآوری)',
  ttsEnabled: 'خواندن پاسخ معلم با صدا (TTS)',
  defaultVoiceInputLanguage: 'زبان پیش‌فرض میکروفن',
  sourceLanguage: 'زبان مادری شما',
  targetLanguage: 'زبانی که یاد می‌گیرید',

  setupTitle: 'به معلم زبان هوش مصنوعی خوش آمدید',
  setupNext: 'بعدی',
  setupBack: 'قبلی',
  setupSaveStart: 'ذخیره و شروع',
  setupStep1: 'زبان مادری دانش‌آموزان این دستگاه چیست؟',
  setupStep2: 'چه زبانی می‌خواهید یاد بگیرید؟',
  setupStep3: 'معلم چند جلسه گذشته را به یاد بیاورد؟',
  setupStep4: 'تنظیمات صدا',
  setupStep5: 'مرور تنظیمات و ذخیره.',

  micListening: 'در حال گوش دادن…',
  micStart: 'شروع میکروفن',
  micStop: 'توقف میکروفن',
  voiceUnavailable: 'ورودی صوتی در این مرورگر موجود نیست.',
  ttsToggle: 'تغییر وضعیت تبدیل متن به گفتار',
  voiceLanguageToggle: 'تغییر زبان میکروفن',
  sendMessage: 'ارسال',

  pleaseLoginChatGPT: 'لطفاً ابتدا وارد ChatGPT شوید و دوباره امتحان کنید.',
  chatGptNotReady: 'ChatGPT آماده نیست. لطفاً صبر کنید و دوباره امتحان کنید.',
  noResponse: 'پاسخی از ChatGPT دریافت نشد (وقت انتظار تمام شد). لطفاً دوباره امتحان کنید.',
  startFailed: 'شروع جلسه ناموفق بود. اتصال به ChatGPT را بررسی کنید.',
  reportParseFailed: 'گزارش جلسه تولید نشد. می‌توانید دوباره امتحان کنید یا جلسه را بدون گزارش پایان دهید.',
  storageWriteFailed: 'ذخیره داده ناموفق بود. حافظه ممکن است پر باشد.',
  sessionInterrupted: 'آدرس مکالمه تغییر کرده — جلسه ممکن است قطع شده باشد. ادامه یا پایان جلسه را انتخاب کنید.',

  teacher: 'معلم',
  student: 'دانش‌آموز',
  thinking: 'معلم در حال فکر کردن است…',
  connecting: 'در حال اتصال به معلم…',
  endingLesson: 'پایان جلسه و تولید گزارش…',
  lessonComplete: 'جلسه پایان یافت',

  voiceSessionHint: 'مستقیماً با معلم صحبت کنید. حالت صوتی ChatGPT فعال است.',
  voiceModeActivating: 'در حال فعال‌سازی حالت صوتی…',
  voiceModeNotFound: 'فعال‌سازی خودکار حالت صوتی ممکن نشد. لطفاً دکمه میکروفن را در ChatGPT بزنید.',
  endingVoiceLesson: 'در حال توقف صدا و تولید گزارش…',

  overallScore: 'نمره کل',
  grammarScore: 'گرامر',
  vocabularyScore: 'لغات',
  participationScore: 'مشارکت',
  readingScore: 'خواندن',
  writingScore: 'نوشتن',

  homework: 'تکلیف',
  teacherNotes: 'یادداشت معلم',
  strengthsObserved: 'نقاط قوت مشاهده‌شده',
  weaknessesObserved: 'حوزه‌های نیاز به بهبود',

  clearProgress: 'پاک کردن پیشرفت',
  clearProgressConfirm: 'این عمل تمام تاریخچه درس‌ها و پیشرفت یادگیری این دانش‌آموز را به‌طور دائمی حذف می‌کند. پروفایل دانش‌آموز (نام، زبان‌ها، سطح) حفظ می‌شود. این عمل قابل بازگشت نیست.',
  clearProgressSuccess: 'پیشرفت پاک شد.',

  appTitle: 'معلم زبان هوش مصنوعی',
  minimize: 'کوچک کردن',
};

export default fa;
