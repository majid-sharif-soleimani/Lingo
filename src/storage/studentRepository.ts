/**
 * Repository for StudentProfiles stored under chrome.storage.local key: 'students'.
 * Owns both the student records AND their embedded lesson history — no separate repository.
 * Storage format: Record<string, StudentProfile> (keyed by student.id).
 */

import { v4 as uuidv4 } from 'uuid';
import type { StudentProfile, LessonSummary } from '../types/index';
import { read, write } from './storageHelper';

const STORAGE_KEY = 'students';

/** Reads the entire students map from storage. */
async function readAll(): Promise<Record<string, StudentProfile>> {
  return read<Record<string, StudentProfile>>(STORAGE_KEY, {});
}

/** Persists the entire students map to storage. */
async function writeAll(map: Record<string, StudentProfile>): Promise<void> {
  await write(STORAGE_KEY, map);
}

/**
 * Returns all students as a sorted array (by name).
 */
export async function getAll(): Promise<StudentProfile[]> {
  const map = await readAll();
  return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Returns a single student by id, or null if not found.
 */
export async function getById(id: string): Promise<StudentProfile | null> {
  const map = await readAll();
  return map[id] ?? null;
}

/**
 * Creates a new student with auto-generated id, createdAt, updatedAt, and empty lessonHistory.
 */
export async function create(
  data: Omit<StudentProfile, 'id' | 'createdAt' | 'updatedAt' | 'lessonHistory'>
): Promise<StudentProfile> {
  const map = await readAll();
  const now = new Date().toISOString();
  const student: StudentProfile = {
    ...data,
    id: uuidv4(),
    lessonHistory: [],
    createdAt: now,
    updatedAt: now,
  };
  map[student.id] = student;
  await writeAll(map);
  return student;
}

/**
 * Merges partial data into an existing student and updates updatedAt.
 * Throws if the student is not found.
 */
export async function update(id: string, data: Partial<StudentProfile>): Promise<StudentProfile> {
  const map = await readAll();
  const existing = map[id];
  if (!existing) throw new Error(`Student not found: ${id}`);
  const updated: StudentProfile = { ...existing, ...data, updatedAt: new Date().toISOString() };
  map[id] = updated;
  await writeAll(map);
  return updated;
}

/**
 * Deletes a student and all their lesson history.
 */
export async function deleteStudent(id: string): Promise<void> {
  const map = await readAll();
  delete map[id];
  await writeAll(map);
}

/**
 * Returns the student's lessons, most recent first, limited to n entries.
 */
export async function getLastNLessons(studentId: string, n: number): Promise<LessonSummary[]> {
  const student = await getById(studentId);
  if (!student) return [];
  return [...student.lessonHistory]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, n);
}

/**
 * Appends a completed lesson summary to the student's history.
 * Prunes oldest entries beyond maxLessons.
 * Also updates the student's aggregate topic arrays and updatedAt.
 */
export async function appendLesson(
  studentId: string,
  lesson: LessonSummary,
  maxLessons: number
): Promise<void> {
  const map = await readAll();
  const student = map[studentId];
  if (!student) throw new Error(`Student not found: ${studentId}`);

  // Append new lesson
  student.lessonHistory.push(lesson);

  // Prune oldest beyond maxLessons
  while (student.lessonHistory.length > maxLessons) {
    student.lessonHistory.shift();
  }

  // Update aggregate topic lists (union — no duplicates)
  student.grammarTopicsLearned = unique([
    ...student.grammarTopicsLearned,
    ...lesson.grammarTopics,
  ]);
  student.vocabularyTopicsLearned = unique([
    ...student.vocabularyTopicsLearned,
    ...lesson.vocabularyTopics,
  ]);
  student.readingTopicsCompleted = unique([
    ...student.readingTopicsCompleted,
    ...lesson.readingTopics,
  ]);
  student.writingTopicsCompleted = unique([
    ...student.writingTopicsCompleted,
    ...lesson.writingTopics,
  ]);

  student.updatedAt = new Date().toISOString();
  map[studentId] = student;
  await writeAll(map);
}

/**
 * Clears a student's lesson history and all accumulated topic lists.
 * The student's profile (name, languages, level, goals, etc.) is preserved.
 */
export async function clearProgress(studentId: string): Promise<void> {
  const map = await readAll();
  const student = map[studentId];
  if (!student) throw new Error(`Student not found: ${studentId}`);
  student.lessonHistory = [];
  student.grammarTopicsLearned = [];
  student.vocabularyTopicsLearned = [];
  student.readingTopicsCompleted = [];
  student.writingTopicsCompleted = [];
  student.updatedAt = new Date().toISOString();
  map[studentId] = student;
  await writeAll(map);
}

/** Returns an array with duplicate strings removed (preserving first occurrence). */
function unique(arr: string[]): string[] {
  return [...new Set(arr)];
}
