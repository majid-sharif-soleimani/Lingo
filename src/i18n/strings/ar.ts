/**
 * Arabic UI strings — RTL language.
 */
import type { UIStrings } from './en';

const ar: UIStrings = {
  startLesson: 'بدء الدرس',
  endLesson: 'إنهاء الدرس',
  endLessonNow: 'إنهاء الدرس الآن',
  resumeLesson: 'متابعة على أي حال',
  retryMessage: 'إعادة المحاولة',

  addStudent: 'إضافة طالب',
  editStudent: 'تعديل الطالب',
  deleteStudent: 'حذف الطالب',
  saveStudent: 'حفظ الطالب',
  cancelEdit: 'إلغاء',
  confirmDeleteStudent: 'هل أنت متأكد أنك تريد حذف هذا الطالب وجميع سجلات دروسه؟',

  studentName: 'الاسم',
  studentAge: 'العمر',
  languageLevel: 'مستوى اللغة',
  goals: 'الأهداف',
  strengths: 'نقاط القوة',
  weaknesses: 'نقاط الضعف',
  ageGroupLabel: 'الفئة العمرية',

  canReadWriteSource: 'يستطيع القراءة والكتابة باللغة الأصلية',
  canReadWriteTarget: 'يستطيع القراءة والكتابة باللغة المستهدفة',
  noticeSourceVoiceOnly: 'ستكون الشرح موجزاً وبأسلوب شفهي (بدون نصوص مكتوبة طويلة).',
  noticeNoReadWrite: 'جلسات الفهم القرائي والتدريب الكتابي معطلة لهذا الطالب.',

  createStudentFirst: 'الرجاء إضافة طالب أولاً قبل بدء الدرس.',
  noStudentsYet: 'لا يوجد طلاب بعد. انقر على "إضافة طالب" لإنشاء واحد.',
  noLessonsYet: 'لم تُسجَّل أي دروس بعد.',

  tabLesson: 'الدرس',
  tabStudents: 'الطلاب',
  tabHistory: 'السجل',
  tabData: 'البيانات',

  lessonHistory: 'سجل الدروس',

  sessionType: 'نوع الجلسة',
  selectStudent: 'اختر طالباً',
  lessonHint: 'بعد البدء، تحدث مع المعلم مباشرة في هذه النافذة.',

  voiceConversation: 'محادثة صوتية',
  conversationPractice: 'تدريب المحادثة',
  grammarLesson: 'درس القواعد',
  readingComprehension: 'الفهم القرائي',
  writingPractice: 'تدريب الكتابة',
  mixedLesson: 'درس مختلط',

  beginner: 'مبتدئ',
  elementary: 'ابتدائي',
  preIntermediate: 'ما قبل المتوسط',
  intermediate: 'متوسط',
  upperIntermediate: 'فوق المتوسط',
  advanced: 'متقدم',

  exportData: 'تصدير البيانات',
  importData: 'استيراد البيانات',
  storageUsage: 'استخدام التخزين',
  storageWarning: 'تحذير: التخزين ممتلئ أكثر من 80٪. فكر في التصدير وحذف الدروس القديمة.',
  importMergeWarning: 'الاستيراد سيدمج البيانات: الطلاب الموجودون سيُحدَّثون، والجدد سيُضافون، والإعدادات ستُستبدل. لا يمكن التراجع عن هذا.',
  importSuccess: 'تم الاستيراد بنجاح!',
  importInvalidJson: 'خطأ: الملف ليس JSON صالحاً.',
  importInvalidStructure: 'خطأ: هيكل الملف لا يتطابق مع تنسيق النسخ الاحتياطي المتوقع.',

  editSettings: 'تعديل الإعدادات',
  saveSettings: 'حفظ الإعدادات',
  memoryDepth: 'عمق الذاكرة (عدد الدروس للتذكر)',
  ttsEnabled: 'قراءة ردود المعلم بصوت عالٍ (TTS)',
  defaultVoiceInputLanguage: 'لغة الميكروفون الافتراضية',
  sourceLanguage: 'لغتك الأصلية',
  targetLanguage: 'اللغة التي تتعلمها',

  setupTitle: 'مرحباً بك في معلم اللغة بالذكاء الاصطناعي',
  setupNext: 'التالي',
  setupBack: 'السابق',
  setupSaveStart: 'حفظ وبدء',
  setupStep1: 'ما هي اللغة الأم للطلاب على هذا الجهاز؟',
  setupStep2: 'ما اللغة التي تريد تعلمها؟',
  setupStep3: 'كم درساً ماضياً يجب أن يتذكر المعلم؟',
  setupStep4: 'تفضيلات الصوت',
  setupStep5: 'مراجعة الإعدادات والحفظ.',

  micListening: 'جارٍ الاستماع…',
  micStart: 'تشغيل الميكروفون',
  micStop: 'إيقاف الميكروفون',
  voiceUnavailable: 'إدخال الصوت غير متاح في هذا المتصفح.',
  ttsToggle: 'تبديل تحويل النص إلى كلام',
  voiceLanguageToggle: 'تغيير لغة الميكروفون',
  sendMessage: 'إرسال',

  pleaseLoginChatGPT: 'الرجاء تسجيل الدخول إلى ChatGPT أولاً، ثم حاول مرة أخرى.',
  chatGptNotReady: 'ChatGPT غير جاهز. الرجاء الانتظار والمحاولة مرة أخرى.',
  noResponse: 'لم يتلقَّ أي رد من ChatGPT (انتهت المهلة). الرجاء المحاولة مرة أخرى.',
  startFailed: 'فشل بدء الدرس. تحقق من اتصالك بـ ChatGPT وأعد المحاولة.',
  reportParseFailed: 'تعذَّر إنشاء تقرير الدرس. يمكنك إعادة المحاولة أو إنهاء الجلسة بدون تقرير.',
  storageWriteFailed: 'فشل حفظ البيانات. قد يكون التخزين ممتلئاً.',
  sessionInterrupted: 'تغيَّر رابط المحادثة — قد تكون الجلسة قد انقطعت. اختر المتابعة أو إنهاء الدرس.',

  teacher: 'المعلم',
  student: 'الطالب',
  thinking: 'المعلم يفكر…',
  connecting: 'جارٍ الاتصال بالمعلم…',
  endingLesson: 'جارٍ إنهاء الدرس وإنشاء التقرير…',
  lessonComplete: 'اكتمل الدرس',

  voiceSessionHint: 'تحدث مباشرة مع معلمك. وضع الصوت في ChatGPT نشط.',
  voiceModeActivating: 'جارٍ تفعيل وضع الصوت…',
  voiceModeNotFound: 'تعذَّر تفعيل وضع الصوت تلقائياً. يرجى النقر على زر الميكروفون في ChatGPT.',
  endingVoiceLesson: 'جارٍ إيقاف الصوت وإنشاء التقرير…',

  overallScore: 'الدرجة الكلية',
  grammarScore: 'القواعد',
  vocabularyScore: 'المفردات',
  participationScore: 'المشاركة',
  readingScore: 'القراءة',
  writingScore: 'الكتابة',

  homework: 'الواجب المنزلي',
  teacherNotes: 'ملاحظات المعلم',
  strengthsObserved: 'نقاط القوة المُلاحظة',
  weaknessesObserved: 'مجالات التحسين',

  clearProgress: 'مسح التقدم',
  clearProgressConfirm: 'سيؤدي هذا إلى حذف جميع سجلات الدروس وتقدم التعلم لهذا الطالب بشكل دائم. سيتم الاحتفاظ بملف الطالب. لا يمكن التراجع عن هذا الإجراء.',
  clearProgressSuccess: 'تم مسح التقدم.',

  appTitle: 'معلم اللغة بالذكاء الاصطناعي',
  minimize: 'تصغير',
};

export default ar;
