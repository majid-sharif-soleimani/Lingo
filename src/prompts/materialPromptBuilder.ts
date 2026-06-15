/**
 * Builds prompts for each practice material type.
 * All prompts use targetLanguage for exercises and sourceLanguage for instructions/answer key.
 */
import type { StudentProfile, MaterialType, LanguageLevel } from '../types/index';

export function buildMaterialPrompt(
  student: StudentProfile,
  type: MaterialType,
  topic: string,
  level: LanguageLevel
): string {
  const { sourceLanguage: src, targetLanguage: tgt } = student;
  const base = `Native language: ${src} | Target language: ${tgt} | Level: ${level} | Topic: ${topic}\n\n`;

  switch (type) {
    case 'vocabulary':
      return base + `Create a vocabulary practice worksheet. Write ALL instructions and the answer key in ${src}. Write ALL exercises in ${tgt}.
Use this exact structure:
## Vocabulary: ${topic}
### Word List
List 10 key words/phrases with their ${src} translation. Bold each word.
### Exercise 1: Fill in the Blank
10 sentences with one blank each. Use the words from the word list.
### Exercise 2: Match the Definition
5 words with 5 definitions to match (label words A-E, definitions 1-5).
### Answer Key
Answers for both exercises in ${src}.`;

    case 'grammar':
      return base + `Create a grammar practice worksheet. Write ALL instructions and the answer key in ${src}. Write ALL exercises in ${tgt}.
Use this exact structure:
## Grammar: ${topic}
### Quick Reference (in ${src})
2-3 sentence rule explanation with the pattern in bold.
### Exercise 1: Fill in the Blank (10 sentences)
### Exercise 2: Sentence Transformation (5 sentences — rewrite as instructed)
### Exercise 3: Error Correction (5 sentences — find and fix the mistake)
### Answer Key
Complete answers in ${src}.`;

    case 'reading':
      return base + `Create a reading comprehension worksheet. Write ALL instructions in ${src}. Write the passage in ${tgt}.
Use this exact structure:
## Reading: ${topic}
### Passage (in ${tgt}, 250-350 words)
[passage here]
### Comprehension Questions (in ${src}, answer in ${tgt})
5 numbered questions about the passage.
### Vocabulary Focus
5 words from the passage — bold word, ${src} translation, example sentence in ${tgt}.
### Answer Key (in ${src})`;

    case 'writing':
      return base + `Create a writing practice worksheet. Write ALL content in ${src} except model sentences which are in ${tgt}.
Use this exact structure:
## Writing Task: ${topic}
### Task Description (in ${src})
Clear writing task (60-100 words) with context and goal.
### Useful Phrases (in ${tgt})
8-10 helpful phrases/sentences the student can use, with ${src} translation.
### Self-Correction Checklist (in ${src})
10 checkboxes covering grammar, vocabulary, structure, and task completion.`;

    case 'review':
      return base + `Create a mixed review worksheet covering ${topic}. Write ALL instructions and the answer key in ${src}. Write ALL exercises in ${tgt}.
Use this exact structure:
## Review: ${topic}
### Part 1: Grammar (8 questions)
Fill-in-the-blank or multiple-choice.
### Part 2: Vocabulary (7 questions)
Translation or matching.
### Part 3: Reading Mini-Passage (1 paragraph + 5 questions)
Short passage followed by 5 comprehension questions.
### Answer Key (in ${src})`;
  }
}
