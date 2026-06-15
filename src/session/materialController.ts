/**
 * Material Controller — generates standalone practice materials via ChatGPT.
 * Does not create an ActiveSession or persist any data.
 */
import type { StudentProfile, MaterialType, LanguageLevel } from '../types/index';
import { buildMaterialPrompt } from '../prompts/materialPromptBuilder';
import { sendToChatGPT } from '../content/chatRelay';
import { startNewConversation, isChatGPTReady } from '../content/domIntegration';
import { RelayError } from '../content/chatRelay';

export { RelayError };

export async function generateMaterial(
  student: StudentProfile,
  type: MaterialType,
  topic: string,
  level: LanguageLevel
): Promise<string> {
  if (!isChatGPTReady()) throw new RelayError('not-ready');
  await startNewConversation();
  return await sendToChatGPT(buildMaterialPrompt(student, type, topic, level));
}
