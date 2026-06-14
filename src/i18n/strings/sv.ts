/**
 * Swedish UI strings.
 */
import type { UIStrings } from './en';

const sv: UIStrings = {
  startLesson: 'Starta lektion',
  endLesson: 'Avsluta lektion',
  endLessonNow: 'Avsluta lektion nu',
  resumeLesson: 'Fortsätt ändå',
  retryMessage: 'Försök igen',

  addStudent: 'Lägg till elev',
  editStudent: 'Redigera elev',
  deleteStudent: 'Ta bort elev',
  saveStudent: 'Spara elev',
  cancelEdit: 'Avbryt',
  confirmDeleteStudent: 'Är du säker på att du vill ta bort denna elev och all deras lektionshistorik?',

  studentName: 'Namn',
  studentAge: 'Ålder',
  languageLevel: 'Språknivå',
  goals: 'Mål',
  strengths: 'Styrkor',
  weaknesses: 'Svagheter',
  ageGroupLabel: 'Åldersgrupp',

  canReadWriteSource: 'Kan läsa och skriva på modersmålet',
  canReadWriteTarget: 'Kan läsa och skriva på målspråket',
  noticeSourceVoiceOnly: 'Förklaringar blir korta och muntliga (inga långa skrivna texter).',
  noticeNoReadWrite: 'Läsförståelse och skrivövningar är inaktiverade för denna elev.',

  createStudentFirst: 'Lägg till en elev först innan du startar en lektion.',
  noStudentsYet: 'Inga elever ännu. Klicka på "Lägg till elev" för att skapa en.',
  noLessonsYet: 'Inga lektioner har registrerats ännu.',

  tabLesson: 'Lektion',
  tabStudents: 'Elever',
  tabHistory: 'Historik',
  tabData: 'Data',

  lessonHistory: 'Lektionshistorik',

  sessionType: 'Lektionstyp',
  selectStudent: 'Välj elev',
  lessonHint: 'Efter start, chatta med läraren direkt i detta fönster.',

  voiceConversation: 'Röstsamtal',
  conversationPractice: 'Samtalspraktik',
  grammarLesson: 'Grammatiklektion',
  readingComprehension: 'Läsförståelse',
  writingPractice: 'Skrivövning',
  mixedLesson: 'Blandad lektion',

  beginner: 'Nybörjare',
  elementary: 'Grundläggande',
  preIntermediate: 'Förmedel',
  intermediate: 'Medel',
  upperIntermediate: 'Övre medel',
  advanced: 'Avancerad',

  exportData: 'Exportera data',
  importData: 'Importera data',
  storageUsage: 'Lagranvändning',
  storageWarning: 'Varning: Lagringen är mer än 80% full. Överväg att exportera och ta bort gamla lektioner.',
  importMergeWarning: 'Import sammanfogar data: befintliga elever uppdateras, nya läggs till, inställningar ersätts. Detta kan inte ångras.',
  importSuccess: 'Import lyckades!',
  importInvalidJson: 'Fel: Filen är inte giltig JSON.',
  importInvalidStructure: 'Fel: Filstrukturen matchar inte det förväntade säkerhetskopieringsformatet.',

  editSettings: 'Redigera inställningar',
  saveSettings: 'Spara inställningar',
  memoryDepth: 'Minnesnivå (antal lektioner att komma ihåg)',
  ttsEnabled: 'Läs upp lärarens svar med röst (TTS)',
  defaultVoiceInputLanguage: 'Standard mikrofonspråk',
  sourceLanguage: 'Ditt modersmål',
  targetLanguage: 'Språket du lär dig',

  setupTitle: 'Välkommen till AI-Språkläraren',
  setupNext: 'Nästa',
  setupBack: 'Tillbaka',
  setupSaveStart: 'Spara och starta',
  setupStep1: 'Vilket modersmål har eleverna på denna enhet?',
  setupStep2: 'Vilket språk vill du lära dig?',
  setupStep3: 'Hur många tidigare lektioner ska läraren komma ihåg?',
  setupStep4: 'Röstinställningar',
  setupStep5: 'Granska inställningar och spara.',

  micListening: 'Lyssnar…',
  micStart: 'Starta mikrofon',
  micStop: 'Stoppa mikrofon',
  voiceUnavailable: 'Röstinmatning är inte tillgänglig i den här webbläsaren.',
  ttsToggle: 'Växla text-till-tal',
  voiceLanguageToggle: 'Byt mikrofonspråk',
  sendMessage: 'Skicka',

  pleaseLoginChatGPT: 'Logga in på ChatGPT först, försök sedan igen.',
  chatGptNotReady: 'ChatGPT är inte redo. Vänta och försök igen.',
  noResponse: 'Inget svar från ChatGPT (timeout). Försök igen.',
  startFailed: 'Det gick inte att starta lektionen. Kontrollera din ChatGPT-anslutning och försök igen.',
  reportParseFailed: 'Det gick inte att generera lektionsrapporten. Du kan försöka igen eller avsluta sessionen utan att spara en rapport.',
  storageWriteFailed: 'Det gick inte att spara data. Lagringen kan vara full.',
  sessionInterrupted: 'Konversations-URL:en har ändrats — sessionen kan vara avbruten. Fortsätt ändå eller avsluta lektionen nu.',

  teacher: 'Lärare',
  student: 'Elev',
  thinking: 'Läraren tänker…',
  connecting: 'Ansluter till läraren…',
  endingLesson: 'Avslutar lektion och genererar rapport…',
  lessonComplete: 'Lektion slutförd',

  voiceSessionHint: 'Tala direkt med din lärare. ChatGPT:s röstläge är aktivt.',
  voiceModeActivating: 'Aktiverar röstläge…',
  voiceModeNotFound: 'Det gick inte att aktivera röstläget automatiskt. Klicka på mikrofonknappen i ChatGPT.',
  endingVoiceLesson: 'Stoppar röst och genererar rapport…',

  overallScore: 'Totalt betyg',
  grammarScore: 'Grammatik',
  vocabularyScore: 'Ordförråd',
  participationScore: 'Deltagande',
  readingScore: 'Läsning',
  writingScore: 'Skrivning',

  homework: 'Läxa',
  teacherNotes: 'Lärarnotes',
  strengthsObserved: 'Observerade styrkor',
  weaknessesObserved: 'Förbättringsområden',

  clearProgress: 'Rensa framsteg',
  clearProgressConfirm: 'Detta tar permanent bort all lektionshistorik och inlärningsframsteg för den här studenten. Studentprofilen (namn, språk, nivå) behålls. Det går inte att ångra.',
  clearProgressSuccess: 'Framsteg rensade.',

  appTitle: 'AI-Språklärare',
  minimize: 'Minimera',
};

export default sv;
