/**
 * English UI strings — the fallback locale and the definition of the UIStrings type.
 * Every other locale file must export an object that satisfies this type exactly.
 */

export interface UIStrings {
  // Lesson actions
  startLesson: string;
  endLesson: string;
  endLessonNow: string;
  resumeLesson: string;
  retryMessage: string;

  // Student CRUD
  addStudent: string;
  editStudent: string;
  deleteStudent: string;
  saveStudent: string;
  cancelEdit: string;
  confirmDeleteStudent: string;

  // Student form fields
  studentName: string;
  studentAge: string;
  languageLevel: string;
  goals: string;
  strengths: string;
  weaknesses: string;
  ageGroupLabel: string;

  // Literacy notices
  canReadWriteSource: string;
  canReadWriteTarget: string;
  noticeSourceVoiceOnly: string;
  noticeNoReadWrite: string;

  // Empty-state messages
  createStudentFirst: string;
  noStudentsYet: string;
  noLessonsYet: string;

  // Tab labels
  tabLesson: string;
  tabStudents: string;
  tabHistory: string;
  tabData: string;

  // History
  lessonHistory: string;

  // Session
  sessionType: string;
  selectStudent: string;
  lessonHint: string;

  // Session types
  voiceConversation: string;
  conversationPractice: string;
  grammarLesson: string;
  readingComprehension: string;
  writingPractice: string;
  mixedLesson: string;

  // Language levels
  beginner: string;
  elementary: string;
  preIntermediate: string;
  intermediate: string;
  upperIntermediate: string;
  advanced: string;

  // Data tab
  exportData: string;
  importData: string;
  storageUsage: string;
  storageWarning: string;
  importMergeWarning: string;
  importSuccess: string;
  importInvalidJson: string;
  importInvalidStructure: string;

  // Settings
  editSettings: string;
  saveSettings: string;
  memoryDepth: string;
  ttsEnabled: string;
  defaultVoiceInputLanguage: string;
  sourceLanguage: string;
  targetLanguage: string;

  // Setup wizard
  setupTitle: string;
  setupNext: string;
  setupBack: string;
  setupSaveStart: string;
  setupStep1: string;
  setupStep2: string;
  setupStep3: string;
  setupStep4: string;
  setupStep5: string;

  // Voice / mic
  micListening: string;
  micStart: string;
  micStop: string;
  voiceUnavailable: string;
  ttsToggle: string;
  voiceLanguageToggle: string;
  sendMessage: string;

  // Errors
  pleaseLoginChatGPT: string;
  chatGptNotReady: string;
  noResponse: string;
  startFailed: string;
  reportParseFailed: string;
  storageWriteFailed: string;
  sessionInterrupted: string;

  // Chat roles / states
  teacher: string;
  student: string;
  thinking: string;
  connecting: string;
  endingLesson: string;
  lessonComplete: string;

  // Voice conversation
  voiceSessionHint: string;
  voiceModeActivating: string;
  voiceModeNotFound: string;
  endingVoiceLesson: string;

  // Lesson report score labels
  overallScore: string;
  grammarScore: string;
  vocabularyScore: string;
  participationScore: string;
  readingScore: string;
  writingScore: string;

  // Lesson report section labels
  homework: string;
  teacherNotes: string;
  strengthsObserved: string;
  weaknessesObserved: string;

  // Clear progress
  clearProgress: string;
  clearProgressConfirm: string;
  clearProgressSuccess: string;

  // General UI
  appTitle: string;
  minimize: string;

  // Plan tab
  tabPlan: string;
  generatePlan: string;
  planTargetLevel: string;
  planDuration: string;
  planDurationDays: string;
  planFrequency: string;
  planSessionLength: string;
  planSessionMinutes: string;
  planStartDate: string;
  planGenerating: string;
  planStale: string;
  planRegenerate: string;
  planRegenerateConfirm: string;
  planKeepCurrent: string;
  planProgress: string;
  planDay: string;
  planStartThisLesson: string;
  planNoActivePlan: string;
  planParseFailed: string;
  planFollowPlan: string;
  planChooseManually: string;
  planNextDay: string;
  // Frequency labels
  freqDaily: string;
  freqWeekdays: string;
  freqAlternate: string;
  freqWeekly: string;
  // Practice material generator
  practiceTitle: string;
  practiceType: string;
  practiceTopic: string;
  practiceTopicPlaceholder: string;
  practiceLevel: string;
  practiceGenerate: string;
  practiceGenerating: string;
  practiceDownloadPdf: string;
  practiceBack: string;
  practiceTypeVocabulary: string;
  practiceTypeGrammar: string;
  practiceTypeReading: string;
  practiceTypeWriting: string;
  practiceTypeReview: string;
}

const en: UIStrings = {
  // Lesson actions
  startLesson: 'Start Lesson',
  endLesson: 'End Lesson',
  endLessonNow: 'End Lesson Now',
  resumeLesson: 'Resume Anyway',
  retryMessage: 'Retry',

  // Student CRUD
  addStudent: 'Add Student',
  editStudent: 'Edit Student',
  deleteStudent: 'Delete Student',
  saveStudent: 'Save Student',
  cancelEdit: 'Cancel',
  confirmDeleteStudent: 'Are you sure you want to delete this student and all their lesson history?',

  // Student form fields
  studentName: 'Name',
  studentAge: 'Age',
  languageLevel: 'Language Level',
  goals: 'Goals',
  strengths: 'Strengths',
  weaknesses: 'Weaknesses',
  ageGroupLabel: 'Age Group',

  // Literacy notices
  canReadWriteSource: 'Can read & write in source language',
  canReadWriteTarget: 'Can read & write in target language',
  noticeSourceVoiceOnly: 'Explanations will be kept short and spoken-style (no long written text).',
  noticeNoReadWrite: 'Reading Comprehension and Writing Practice sessions are disabled for this student.',

  // Empty-state messages
  createStudentFirst: 'Please add a student first before starting a lesson.',
  noStudentsYet: 'No students yet. Click "Add Student" to create one.',
  noLessonsYet: 'No lessons recorded yet.',

  // Tab labels
  tabLesson: 'Lesson',
  tabStudents: 'Students',
  tabHistory: 'History',
  tabData: 'Data',

  // History
  lessonHistory: 'Lesson History',

  // Session
  sessionType: 'Session Type',
  selectStudent: 'Select a student',
  lessonHint: 'After starting, chat with the teacher right here in this window.',

  // Session types
  voiceConversation: 'Voice Conversation',
  conversationPractice: 'Conversation Practice',
  grammarLesson: 'Grammar Lesson',
  readingComprehension: 'Reading Comprehension',
  writingPractice: 'Writing Practice',
  mixedLesson: 'Mixed Lesson',

  // Language levels
  beginner: 'Beginner',
  elementary: 'Elementary',
  preIntermediate: 'Pre-Intermediate',
  intermediate: 'Intermediate',
  upperIntermediate: 'Upper-Intermediate',
  advanced: 'Advanced',

  // Data tab
  exportData: 'Export Data',
  importData: 'Import Data',
  storageUsage: 'Storage Usage',
  storageWarning: 'Warning: storage is over 80% full. Consider exporting and pruning old lessons.',
  importMergeWarning: 'Import will MERGE data: existing students will be updated, new ones added. Settings will be replaced. This cannot be undone.',
  importSuccess: 'Import successful!',
  importInvalidJson: 'Error: the file is not valid JSON.',
  importInvalidStructure: 'Error: the file does not match the expected backup format.',

  // Settings
  editSettings: 'Edit Settings',
  saveSettings: 'Save Settings',
  memoryDepth: 'Memory Depth (lessons to recall)',
  ttsEnabled: 'Read teacher replies aloud (TTS)',
  defaultVoiceInputLanguage: 'Default microphone language',
  sourceLanguage: 'Your Language (Source)',
  targetLanguage: 'Language Being Taught (Target)',

  // Setup wizard
  setupTitle: 'Welcome to AI Language Teacher',
  setupNext: 'Next',
  setupBack: 'Back',
  setupSaveStart: 'Save & Start',
  setupStep1: 'What is the native language of the students on this device?',
  setupStep2: 'What language do you want to learn?',
  setupStep3: 'How many past lessons should the teacher remember per session?',
  setupStep4: 'Voice preferences',
  setupStep5: 'Review your settings and save.',

  // Voice / mic
  micListening: 'Listening…',
  micStart: 'Start microphone',
  micStop: 'Stop microphone',
  voiceUnavailable: 'Voice input is not available in this browser.',
  ttsToggle: 'Toggle text-to-speech',
  voiceLanguageToggle: 'Switch microphone language',
  sendMessage: 'Send',

  // Errors
  pleaseLoginChatGPT: 'Please log in to ChatGPT first, then try again.',
  chatGptNotReady: 'ChatGPT is not ready. Please wait and try again.',
  noResponse: 'No response from ChatGPT (timeout). Please try again.',
  startFailed: 'Failed to start the lesson. Please check your ChatGPT connection and retry.',
  reportParseFailed: 'Could not generate the lesson report. You can retry or end the session without saving a report.',
  storageWriteFailed: 'Failed to save data. Storage may be full.',
  sessionInterrupted: 'The conversation URL has changed — the session may be interrupted. Resume anyway or end the lesson now.',

  // Chat roles / states
  teacher: 'Teacher',
  student: 'Student',
  thinking: 'Teacher is thinking…',
  connecting: 'Connecting to teacher…',
  endingLesson: 'Ending lesson and generating report…',
  lessonComplete: 'Lesson Complete',

  voiceSessionHint: 'Speak directly with your teacher. ChatGPT\'s voice mode is active.',
  voiceModeActivating: 'Activating voice mode…',
  voiceModeNotFound: 'Could not activate voice mode automatically. Please click the microphone button in ChatGPT.',
  endingVoiceLesson: 'Stopping voice and generating report…',

  // Score labels
  overallScore: 'Overall Score',
  grammarScore: 'Grammar',
  vocabularyScore: 'Vocabulary',
  participationScore: 'Participation',
  readingScore: 'Reading',
  writingScore: 'Writing',

  // Report sections
  homework: 'Homework',
  teacherNotes: "Teacher's Notes",
  strengthsObserved: 'Strengths Observed',
  weaknessesObserved: 'Areas to Improve',

  // Clear progress
  clearProgress: 'Clear Progress',
  clearProgressConfirm: 'This will permanently delete all lesson history and learning progress for this student. The student profile (name, languages, level) will be kept. This cannot be undone.',
  clearProgressSuccess: 'Progress cleared.',

  // General UI
  appTitle: 'AI Language Teacher',
  minimize: 'Minimize',

  // Plan tab
  tabPlan: 'Plan',
  generatePlan: 'Generate Learning Plan',
  planTargetLevel: 'Target Level',
  planDuration: 'Duration',
  planDurationDays: 'days',
  planFrequency: 'Practice Frequency',
  planSessionLength: 'Session Length',
  planSessionMinutes: 'min / session',
  planStartDate: 'Start Date',
  planGenerating: 'ChatGPT is building your plan…',
  planStale: 'Your student profile has changed. Regenerate the plan to keep it accurate.',
  planRegenerate: 'Regenerate Plan',
  planRegenerateConfirm: 'Regenerating will permanently reset all plan progress. Continue?',
  planKeepCurrent: 'Keep Current Plan',
  planProgress: 'Progress',
  planDay: 'Day',
  planStartThisLesson: 'Start This Lesson',
  planNoActivePlan: 'No learning plan yet.',
  planParseFailed: 'Could not parse the learning plan. Please try again.',
  planFollowPlan: 'Follow my learning plan',
  planChooseManually: 'Choose session type manually',
  planNextDay: 'Next lesson',
  // Frequency labels
  freqDaily: 'Every day',
  freqWeekdays: 'Weekdays (Mon–Fri)',
  freqAlternate: 'Every other day',
  freqWeekly: 'Once a week',
  // Practice material generator
  practiceTitle: 'Practice Materials',
  practiceType: 'Material Type',
  practiceTopic: 'Topic',
  practiceTopicPlaceholder: 'e.g. Present Perfect, travel vocabulary…',
  practiceLevel: 'Level',
  practiceGenerate: 'Generate',
  practiceGenerating: 'Generating…',
  practiceDownloadPdf: 'Download PDF',
  practiceBack: '← Back',
  practiceTypeVocabulary: 'Vocabulary Quiz',
  practiceTypeGrammar: 'Grammar Exercises',
  practiceTypeReading: 'Reading Passage',
  practiceTypeWriting: 'Writing Prompt',
  practiceTypeReview: 'Review Sheet',
};

export default en;
