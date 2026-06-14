/**
 * Spanish UI strings.
 */
import type { UIStrings } from './en';

const es: UIStrings = {
  startLesson: 'Iniciar lección',
  endLesson: 'Terminar lección',
  endLessonNow: 'Terminar lección ahora',
  resumeLesson: 'Continuar de todos modos',
  retryMessage: 'Reintentar',

  addStudent: 'Agregar estudiante',
  editStudent: 'Editar estudiante',
  deleteStudent: 'Eliminar estudiante',
  saveStudent: 'Guardar estudiante',
  cancelEdit: 'Cancelar',
  confirmDeleteStudent: '¿Está seguro de que desea eliminar este estudiante y todo su historial de lecciones?',

  studentName: 'Nombre',
  studentAge: 'Edad',
  languageLevel: 'Nivel de idioma',
  goals: 'Objetivos',
  strengths: 'Fortalezas',
  weaknesses: 'Debilidades',
  ageGroupLabel: 'Grupo de edad',

  canReadWriteSource: 'Puede leer y escribir en el idioma fuente',
  canReadWriteTarget: 'Puede leer y escribir en el idioma objetivo',
  noticeSourceVoiceOnly: 'Las explicaciones serán breves y orales (sin textos escritos largos).',
  noticeNoReadWrite: 'Las sesiones de comprensión lectora y práctica de escritura están desactivadas para este estudiante.',

  createStudentFirst: 'Por favor, añada un estudiante antes de iniciar una lección.',
  noStudentsYet: 'Aún no hay estudiantes. Haga clic en "Agregar estudiante" para crear uno.',
  noLessonsYet: 'Aún no hay lecciones registradas.',

  tabLesson: 'Lección',
  tabStudents: 'Estudiantes',
  tabHistory: 'Historial',
  tabData: 'Datos',

  lessonHistory: 'Historial de lecciones',

  sessionType: 'Tipo de sesión',
  selectStudent: 'Seleccionar estudiante',
  lessonHint: 'Después de iniciar, chatea con el profesor directamente en esta ventana.',

  voiceConversation: 'Conversación por voz',
  conversationPractice: 'Práctica de conversación',
  grammarLesson: 'Lección de gramática',
  readingComprehension: 'Comprensión lectora',
  writingPractice: 'Práctica de escritura',
  mixedLesson: 'Lección mixta',

  beginner: 'Principiante',
  elementary: 'Elemental',
  preIntermediate: 'Pre-intermedio',
  intermediate: 'Intermedio',
  upperIntermediate: 'Intermedio superior',
  advanced: 'Avanzado',

  exportData: 'Exportar datos',
  importData: 'Importar datos',
  storageUsage: 'Uso del almacenamiento',
  storageWarning: 'Advertencia: el almacenamiento está al más del 80 % de capacidad. Considere exportar y eliminar lecciones antiguas.',
  importMergeWarning: 'La importación FUSIONARÁ los datos: los estudiantes existentes se actualizarán, los nuevos se agregarán y la configuración se reemplazará. Esto no se puede deshacer.',
  importSuccess: '¡Importación exitosa!',
  importInvalidJson: 'Error: el archivo no es JSON válido.',
  importInvalidStructure: 'Error: la estructura del archivo no coincide con el formato de copia de seguridad esperado.',

  editSettings: 'Editar configuración',
  saveSettings: 'Guardar configuración',
  memoryDepth: 'Profundidad de memoria (lecciones a recordar)',
  ttsEnabled: 'Leer respuestas del profesor en voz alta (TTS)',
  defaultVoiceInputLanguage: 'Idioma de micrófono predeterminado',
  sourceLanguage: 'Su idioma (fuente)',
  targetLanguage: 'Idioma que se enseña (objetivo)',

  setupTitle: 'Bienvenido al Profesor de Idiomas IA',
  setupNext: 'Siguiente',
  setupBack: 'Anterior',
  setupSaveStart: 'Guardar e iniciar',
  setupStep1: '¿Cuál es el idioma nativo de los estudiantes en este dispositivo?',
  setupStep2: '¿Qué idioma desea aprender?',
  setupStep3: '¿Cuántas lecciones pasadas debe recordar el profesor?',
  setupStep4: 'Preferencias de voz',
  setupStep5: 'Revise su configuración y guarde.',

  micListening: 'Escuchando…',
  micStart: 'Iniciar micrófono',
  micStop: 'Detener micrófono',
  voiceUnavailable: 'La entrada de voz no está disponible en este navegador.',
  ttsToggle: 'Alternar texto a voz',
  voiceLanguageToggle: 'Cambiar idioma del micrófono',
  sendMessage: 'Enviar',

  pleaseLoginChatGPT: 'Por favor, inicie sesión en ChatGPT primero y luego inténtelo de nuevo.',
  chatGptNotReady: 'ChatGPT no está listo. Por favor, espere e inténtelo de nuevo.',
  noResponse: 'Sin respuesta de ChatGPT (tiempo de espera agotado). Por favor, inténtelo de nuevo.',
  startFailed: 'No se pudo iniciar la lección. Verifique su conexión a ChatGPT y reintente.',
  reportParseFailed: 'No se pudo generar el informe de lección. Puede reintentar o terminar la sesión sin informe.',
  storageWriteFailed: 'No se pudieron guardar los datos. Es posible que el almacenamiento esté lleno.',
  sessionInterrupted: 'La URL de la conversación cambió — la sesión puede estar interrumpida. Continúe de todos modos o termine la lección ahora.',

  teacher: 'Profesor',
  student: 'Estudiante',
  thinking: 'El profesor está pensando…',
  connecting: 'Conectando con el profesor…',
  endingLesson: 'Terminando lección y generando informe…',
  lessonComplete: 'Lección completa',

  voiceSessionHint: 'Hable directamente con su profesor. El modo de voz de ChatGPT está activo.',
  voiceModeActivating: 'Activando modo de voz…',
  voiceModeNotFound: 'No se pudo activar el modo de voz automáticamente. Haga clic en el botón del micrófono en ChatGPT.',
  endingVoiceLesson: 'Deteniendo voz y generando informe…',

  overallScore: 'Puntuación general',
  grammarScore: 'Gramática',
  vocabularyScore: 'Vocabulario',
  participationScore: 'Participación',
  readingScore: 'Lectura',
  writingScore: 'Escritura',

  homework: 'Tarea',
  teacherNotes: 'Notas del profesor',
  strengthsObserved: 'Fortalezas observadas',
  weaknessesObserved: 'Áreas de mejora',

  clearProgress: 'Borrar progreso',
  clearProgressConfirm: 'Esto eliminará permanentemente todo el historial de lecciones y el progreso de aprendizaje de este estudiante. El perfil del estudiante (nombre, idiomas, nivel) se conservará. Esta acción no se puede deshacer.',
  clearProgressSuccess: 'Progreso borrado.',

  appTitle: 'Profesor de Idiomas IA',
  minimize: 'Minimizar',
};

export default es;
