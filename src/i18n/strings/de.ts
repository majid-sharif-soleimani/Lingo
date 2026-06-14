/**
 * German UI strings.
 */
import type { UIStrings } from './en';

const de: UIStrings = {
  startLesson: 'Stunde beginnen',
  endLesson: 'Stunde beenden',
  endLessonNow: 'Stunde jetzt beenden',
  resumeLesson: 'Trotzdem fortfahren',
  retryMessage: 'Erneut versuchen',

  addStudent: 'Schüler hinzufügen',
  editStudent: 'Schüler bearbeiten',
  deleteStudent: 'Schüler löschen',
  saveStudent: 'Schüler speichern',
  cancelEdit: 'Abbrechen',
  confirmDeleteStudent: 'Möchten Sie diesen Schüler und seine gesamte Unterrichtshistorie wirklich löschen?',

  studentName: 'Name',
  studentAge: 'Alter',
  languageLevel: 'Sprachniveau',
  goals: 'Ziele',
  strengths: 'Stärken',
  weaknesses: 'Schwächen',
  ageGroupLabel: 'Altersgruppe',

  canReadWriteSource: 'Kann in der Ausgangssprache lesen und schreiben',
  canReadWriteTarget: 'Kann in der Zielsprache lesen und schreiben',
  noticeSourceVoiceOnly: 'Erklärungen werden kurz und mündlich gehalten (keine langen schriftlichen Texte).',
  noticeNoReadWrite: 'Leseverständnis- und Schreibübungsstunden sind für diesen Schüler deaktiviert.',

  createStudentFirst: 'Bitte fügen Sie zuerst einen Schüler hinzu, bevor Sie eine Stunde beginnen.',
  noStudentsYet: 'Noch keine Schüler. Klicken Sie auf "Schüler hinzufügen", um einen zu erstellen.',
  noLessonsYet: 'Noch keine Stunden aufgezeichnet.',

  tabLesson: 'Stunde',
  tabStudents: 'Schüler',
  tabHistory: 'Verlauf',
  tabData: 'Daten',

  lessonHistory: 'Stundenverlauf',

  sessionType: 'Sitzungstyp',
  selectStudent: 'Schüler auswählen',
  lessonHint: 'Nach dem Start unterhalten Sie sich direkt in diesem Fenster mit dem Lehrer.',

  voiceConversation: 'Sprachgespräch',
  conversationPractice: 'Konversationsübung',
  grammarLesson: 'Grammatikstunde',
  readingComprehension: 'Leseverständnis',
  writingPractice: 'Schreibübung',
  mixedLesson: 'Gemischte Stunde',

  beginner: 'Anfänger',
  elementary: 'Grundstufe',
  preIntermediate: 'Untere Mittelstufe',
  intermediate: 'Mittelstufe',
  upperIntermediate: 'Obere Mittelstufe',
  advanced: 'Fortgeschritten',

  exportData: 'Daten exportieren',
  importData: 'Daten importieren',
  storageUsage: 'Speichernutzung',
  storageWarning: 'Warnung: Der Speicher ist zu mehr als 80 % belegt. Erwägen Sie den Export und das Löschen alter Stunden.',
  importMergeWarning: 'Der Import FÜHRT Daten ZUSAMMEN: Bestehende Schüler werden aktualisiert, neue hinzugefügt, Einstellungen ersetzt. Dies kann nicht rückgängig gemacht werden.',
  importSuccess: 'Import erfolgreich!',
  importInvalidJson: 'Fehler: Die Datei ist kein gültiges JSON.',
  importInvalidStructure: 'Fehler: Die Dateistruktur entspricht nicht dem erwarteten Sicherungsformat.',

  editSettings: 'Einstellungen bearbeiten',
  saveSettings: 'Einstellungen speichern',
  memoryDepth: 'Speichertiefe (zu merkende Stunden)',
  ttsEnabled: 'Lehrerantworten vorlesen (TTS)',
  defaultVoiceInputLanguage: 'Standard-Mikrofonsprache',
  sourceLanguage: 'Ihre Sprache (Quelle)',
  targetLanguage: 'Unterrichtete Sprache (Ziel)',

  setupTitle: 'Willkommen beim KI-Sprachlehrer',
  setupNext: 'Weiter',
  setupBack: 'Zurück',
  setupSaveStart: 'Speichern und beginnen',
  setupStep1: 'Was ist die Muttersprache der Schüler auf diesem Gerät?',
  setupStep2: 'Welche Sprache möchten Sie lernen?',
  setupStep3: 'Wie viele vergangene Stunden soll der Lehrer sich merken?',
  setupStep4: 'Spracheinstellungen',
  setupStep5: 'Überprüfen Sie Ihre Einstellungen und speichern Sie.',

  micListening: 'Zuhören…',
  micStart: 'Mikrofon starten',
  micStop: 'Mikrofon stoppen',
  voiceUnavailable: 'Spracheingabe ist in diesem Browser nicht verfügbar.',
  ttsToggle: 'Text-zu-Sprache umschalten',
  voiceLanguageToggle: 'Mikrofonsprache wechseln',
  sendMessage: 'Senden',

  pleaseLoginChatGPT: 'Bitte melden Sie sich zuerst bei ChatGPT an und versuchen Sie es erneut.',
  chatGptNotReady: 'ChatGPT ist nicht bereit. Bitte warten Sie und versuchen Sie es erneut.',
  noResponse: 'Keine Antwort von ChatGPT (Zeitüberschreitung). Bitte versuchen Sie es erneut.',
  startFailed: 'Stunde konnte nicht gestartet werden. Überprüfen Sie Ihre ChatGPT-Verbindung und versuchen Sie es erneut.',
  reportParseFailed: 'Stundenbericht konnte nicht erstellt werden. Sie können es erneut versuchen oder die Sitzung ohne Bericht beenden.',
  storageWriteFailed: 'Daten konnten nicht gespeichert werden. Der Speicher ist möglicherweise voll.',
  sessionInterrupted: 'Die Gesprächs-URL hat sich geändert — die Sitzung wurde möglicherweise unterbrochen. Trotzdem fortfahren oder Stunde jetzt beenden.',

  teacher: 'Lehrer',
  student: 'Schüler',
  thinking: 'Der Lehrer denkt nach…',
  connecting: 'Verbindung zum Lehrer wird hergestellt…',
  endingLesson: 'Stunde wird beendet und Bericht erstellt…',
  lessonComplete: 'Stunde abgeschlossen',

  voiceSessionHint: 'Sprechen Sie direkt mit Ihrem Lehrer. Der Sprachmodus von ChatGPT ist aktiv.',
  voiceModeActivating: 'Sprachmodus wird aktiviert…',
  voiceModeNotFound: 'Sprachmodus konnte nicht automatisch aktiviert werden. Bitte klicken Sie in ChatGPT auf die Mikrofontaste.',
  endingVoiceLesson: 'Sprache wird gestoppt und Bericht erstellt…',

  overallScore: 'Gesamtpunktzahl',
  grammarScore: 'Grammatik',
  vocabularyScore: 'Wortschatz',
  participationScore: 'Teilnahme',
  readingScore: 'Lesen',
  writingScore: 'Schreiben',

  homework: 'Hausaufgaben',
  teacherNotes: 'Lehrernotizen',
  strengthsObserved: 'Beobachtete Stärken',
  weaknessesObserved: 'Verbesserungsbereiche',

  clearProgress: 'Fortschritt löschen',
  clearProgressConfirm: 'Damit werden alle Lektionsverläufe und Lernfortschritte dieses Schülers dauerhaft gelöscht. Das Schülerprofil (Name, Sprachen, Niveau) bleibt erhalten. Dies kann nicht rückgängig gemacht werden.',
  clearProgressSuccess: 'Fortschritt gelöscht.',

  appTitle: 'KI-Sprachlehrer',
  minimize: 'Minimieren',
};

export default de;
