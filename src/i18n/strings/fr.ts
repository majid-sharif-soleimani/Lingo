/**
 * French UI strings.
 */
import type { UIStrings } from './en';

const fr: UIStrings = {
  startLesson: 'Commencer le cours',
  endLesson: 'Terminer le cours',
  endLessonNow: 'Terminer le cours maintenant',
  resumeLesson: 'Continuer quand même',
  retryMessage: 'Réessayer',

  addStudent: 'Ajouter un élève',
  editStudent: "Modifier l'élève",
  deleteStudent: "Supprimer l'élève",
  saveStudent: "Enregistrer l'élève",
  cancelEdit: 'Annuler',
  confirmDeleteStudent: 'Êtes-vous sûr de vouloir supprimer cet élève et tout son historique de cours ?',

  studentName: 'Nom',
  studentAge: 'Âge',
  languageLevel: 'Niveau de langue',
  goals: 'Objectifs',
  strengths: 'Points forts',
  weaknesses: 'Points faibles',
  ageGroupLabel: 'Groupe d\'âge',

  canReadWriteSource: 'Peut lire et écrire dans la langue source',
  canReadWriteTarget: 'Peut lire et écrire dans la langue cible',
  noticeSourceVoiceOnly: 'Les explications seront courtes et orales (pas de longs textes écrits).',
  noticeNoReadWrite: 'Les sessions de compréhension écrite et de rédaction sont désactivées pour cet élève.',

  createStudentFirst: 'Veuillez d\'abord ajouter un élève avant de commencer un cours.',
  noStudentsYet: 'Aucun élève pour l\'instant. Cliquez sur "Ajouter un élève" pour en créer un.',
  noLessonsYet: 'Aucun cours enregistré pour l\'instant.',

  tabLesson: 'Cours',
  tabStudents: 'Élèves',
  tabHistory: 'Historique',
  tabData: 'Données',

  lessonHistory: 'Historique des cours',

  sessionType: 'Type de session',
  selectStudent: 'Sélectionner un élève',
  lessonHint: 'Après le démarrage, discutez avec l\'enseignant directement dans cette fenêtre.',

  voiceConversation: 'Conversation vocale',
  conversationPractice: 'Pratique de la conversation',
  grammarLesson: 'Cours de grammaire',
  readingComprehension: 'Compréhension écrite',
  writingPractice: 'Pratique de l\'écriture',
  mixedLesson: 'Cours mixte',

  beginner: 'Débutant',
  elementary: 'Élémentaire',
  preIntermediate: 'Pré-intermédiaire',
  intermediate: 'Intermédiaire',
  upperIntermediate: 'Intermédiaire supérieur',
  advanced: 'Avancé',

  exportData: 'Exporter les données',
  importData: 'Importer les données',
  storageUsage: 'Utilisation du stockage',
  storageWarning: 'Avertissement : le stockage est utilisé à plus de 80 %. Pensez à exporter et supprimer d\'anciens cours.',
  importMergeWarning: 'L\'importation FUSIONNERA les données : les élèves existants seront mis à jour, les nouveaux ajoutés, les paramètres remplacés. Cette action est irréversible.',
  importSuccess: 'Importation réussie !',
  importInvalidJson: 'Erreur : le fichier n\'est pas du JSON valide.',
  importInvalidStructure: 'Erreur : la structure du fichier ne correspond pas au format de sauvegarde attendu.',

  editSettings: 'Modifier les paramètres',
  saveSettings: 'Enregistrer les paramètres',
  memoryDepth: 'Profondeur de mémoire (cours à mémoriser)',
  ttsEnabled: 'Lire les réponses de l\'enseignant à voix haute (TTS)',
  defaultVoiceInputLanguage: 'Langue du microphone par défaut',
  sourceLanguage: 'Votre langue (source)',
  targetLanguage: 'Langue enseignée (cible)',

  setupTitle: 'Bienvenue dans l\'enseignant de langues IA',
  setupNext: 'Suivant',
  setupBack: 'Précédent',
  setupSaveStart: 'Enregistrer et commencer',
  setupStep1: 'Quelle est la langue maternelle des élèves sur cet appareil ?',
  setupStep2: 'Quelle langue souhaitez-vous apprendre ?',
  setupStep3: 'Combien de cours passés l\'enseignant doit-il mémoriser ?',
  setupStep4: 'Préférences vocales',
  setupStep5: 'Vérifiez vos paramètres et enregistrez.',

  micListening: 'Écoute en cours…',
  micStart: 'Démarrer le microphone',
  micStop: 'Arrêter le microphone',
  voiceUnavailable: 'La saisie vocale n\'est pas disponible dans ce navigateur.',
  ttsToggle: 'Activer/désactiver la synthèse vocale',
  voiceLanguageToggle: 'Changer la langue du microphone',
  sendMessage: 'Envoyer',

  pleaseLoginChatGPT: 'Veuillez d\'abord vous connecter à ChatGPT, puis réessayez.',
  chatGptNotReady: 'ChatGPT n\'est pas prêt. Veuillez patienter et réessayer.',
  noResponse: 'Aucune réponse de ChatGPT (délai expiré). Veuillez réessayer.',
  startFailed: 'Échec du démarrage du cours. Vérifiez votre connexion ChatGPT et réessayez.',
  reportParseFailed: 'Impossible de générer le rapport de cours. Vous pouvez réessayer ou terminer la session sans rapport.',
  storageWriteFailed: 'Échec de l\'enregistrement des données. Le stockage est peut-être plein.',
  sessionInterrupted: 'L\'URL de la conversation a changé — la session est peut-être interrompue. Continuez quand même ou terminez le cours maintenant.',

  teacher: 'Enseignant',
  student: 'Élève',
  thinking: 'L\'enseignant réfléchit…',
  connecting: 'Connexion au professeur…',
  endingLesson: 'Fin du cours et génération du rapport…',
  lessonComplete: 'Cours terminé',

  voiceSessionHint: 'Parlez directement avec votre professeur. Le mode vocal de ChatGPT est actif.',
  voiceModeActivating: 'Activation du mode vocal…',
  voiceModeNotFound: 'Impossible d\'activer le mode vocal automatiquement. Veuillez cliquer sur le bouton microphone dans ChatGPT.',
  endingVoiceLesson: 'Arrêt de la voix et génération du rapport…',

  overallScore: 'Score global',
  grammarScore: 'Grammaire',
  vocabularyScore: 'Vocabulaire',
  participationScore: 'Participation',
  readingScore: 'Lecture',
  writingScore: 'Écriture',

  homework: 'Devoirs',
  teacherNotes: 'Notes de l\'enseignant',
  strengthsObserved: 'Points forts observés',
  weaknessesObserved: 'Domaines à améliorer',

  clearProgress: 'Effacer la progression',
  clearProgressConfirm: "Cela supprimera définitivement tout l'historique des leçons et la progression d'apprentissage de cet élève. Le profil de l'élève (nom, langues, niveau) sera conservé. Cette action est irréversible.",
  clearProgressSuccess: 'Progression effacée.',

  appTitle: 'Enseignant de langues IA',
  minimize: 'Réduire',
};

export default fr;
