#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/cbbd9cc1350bdb620a8a546b0529a24a0b13147799051a92405265256658597b/contract';
import endContract from '../../snapshots/cbbd9cc1350bdb620a8a546b0529a24a0b13147799051a92405265256658597b/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'Answer',
        columns: [
          col('answeredAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('attemptId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isCorrect', 'bool', { codecRef: { codecId: 'pg/bool@1' } }),
          col('questionId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('recallSessionId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('selectedOptionId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'DailyDose',
        columns: [
          col('completedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('completedCount', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('scheduledDate', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('scheduledFor', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('subject', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('targetCount', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('topic', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'DailyDose_status_check_0c1eacab',
            "\"status\" IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED')",
          ),
          checkExpression(
            'DailyDose_type_check_d5baa4dd',
            "\"type\" IN ('REVIEW_MISTAKES', 'PRACTICE_WEAK_SPOT', 'NEW_QUESTIONS', 'MOCK_EXAM', 'REVIEW_TOPIC')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Exam',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('durationMinutes', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('DRAFT'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('subject', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('topic', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Exam_status_check_bc64f66b',
            "\"status\" IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'ExamAttempt',
        columns: [
          col('completedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('correctAnswers', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('examId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('score', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('skippedAnswers', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('startedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('IN_PROGRESS'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('totalQuestions', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('wrongAnswers', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'ExamAttempt_status_check_794484ba',
            "\"status\" IN ('IN_PROGRESS', 'COMPLETED', 'ABANDONED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Faculty',
        columns: [
          col('code', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'File',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('extension', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('mimeType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('originalName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('processedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('processingError', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('sha256', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('sizeBytes', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('UPLOADING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('storageKey', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('uploadedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'File_status_check_13d97761',
            "\"status\" IN ('UPLOADING', 'PROCESSING', 'READY', 'FAILED', 'DELETED')",
          ),
          checkExpression(
            'File_type_check_3277d66d',
            "\"type\" IN ('PDF', 'DOCX', 'PPTX', 'TXT', 'OTHER')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'FileAccess',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('fileId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('lastAccessedAt', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Mistake',
        columns: [
          col('attemptId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('correctAnswer', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('questionId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('recallSessionId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('resolved', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('reviewCount', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('selectedAnswer', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', {
            notNull: true,
            default: lit('WRONG_ANSWER'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('Mistake_type_check_cc4a0546', "\"type\" IN ('WRONG_ANSWER', 'SKIPPED')"),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Profile',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('faculty', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('facultyId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('specialization', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('university', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('year', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Progress',
        columns: [
          col('accuracy', 'float8', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/float8@1' },
          }),
          col('correctAnswers', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('lastActivityAt', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('questionsSeen', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('questionsSolved', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('studyTime', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('subject', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('topic', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('wrongAnswers', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Question',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('difficulty', 'text', {
            notNull: true,
            default: lit('MEDIUM'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('explanation', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('subject', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('text', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('topic', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('topicId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', {
            notNull: true,
            default: lit('SINGLE_CHOICE'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Question_difficulty_check_244bf003',
            "\"difficulty\" IN ('EASY', 'MEDIUM', 'HARD')",
          ),
          checkExpression(
            'Question_type_check_e0f687fd',
            "\"type\" IN ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'QuestionOption',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isCorrect', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('optionOrder', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('questionId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('text', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'RecallSession',
        columns: [
          col('completedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('correctAnswers', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('dailyDoseId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('skippedAnswers', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('startedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('IN_PROGRESS'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('totalQuestions', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('wrongAnswers', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'RecallSession_status_check_794484ba',
            "\"status\" IN ('IN_PROGRESS', 'COMPLETED', 'ABANDONED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'RecallSessionQuestion',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('order', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('questionId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('sessionId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Session',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('expiresAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('lastUsedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('revokedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('tokenHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Subject',
        columns: [
          col('code', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('facultyId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Topic',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('subjectId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'User',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('emailVerified', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('firstName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('lastName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('passwordHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('STUDENT'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('User_role_check_482f18a5', "\"role\" IN ('STUDENT', 'ADMIN')"),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'WeakSpot',
        columns: [
          col('accuracy', 'float8', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/float8@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isResolved', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('lastDetectedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('mistakeCount', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('priority', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('resolvedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('subject', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('topic', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Answer',
        constraint: 'Answer_recallSessionId_questionId_key',
        columns: ['recallSessionId', 'questionId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'DailyDose',
        constraint: 'DailyDose_userId_scheduledDate_key',
        columns: ['userId', 'scheduledDate'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Faculty',
        constraint: 'Faculty_name_key',
        columns: ['name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Faculty',
        constraint: 'Faculty_code_key',
        columns: ['code'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'File',
        constraint: 'File_storageKey_key',
        columns: ['storageKey'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'File',
        constraint: 'File_sha256_key',
        columns: ['sha256'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'FileAccess',
        constraint: 'FileAccess_fileId_userId_key',
        columns: ['fileId', 'userId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Profile',
        constraint: 'Profile_userId_key',
        columns: ['userId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Progress',
        constraint: 'Progress_userId_subject_topic_key',
        columns: ['userId', 'subject', 'topic'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'RecallSessionQuestion',
        constraint: 'RecallSessionQuestion_sessionId_questionId_key',
        columns: ['sessionId', 'questionId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'RecallSessionQuestion',
        constraint: 'RecallSessionQuestion_sessionId_order_key',
        columns: ['sessionId', 'order'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Session',
        constraint: 'Session_tokenHash_key',
        columns: ['tokenHash'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Subject',
        constraint: 'Subject_facultyId_name_key',
        columns: ['facultyId', 'name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Topic',
        constraint: 'Topic_subjectId_name_key',
        columns: ['subjectId', 'name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_email_key',
        columns: ['email'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'WeakSpot',
        constraint: 'WeakSpot_userId_subject_topic_key',
        columns: ['userId', 'subject', 'topic'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Answer',
        index: 'Answer_attemptId_idx_94f50eb9',
        columns: ['attemptId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Answer',
        index: 'Answer_questionId_idx_fdb42076',
        columns: ['questionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Answer',
        index: 'Answer_recallSessionId_idx_0ea6612d',
        columns: ['recallSessionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'DailyDose',
        index: 'DailyDose_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'DailyDose',
        index: 'DailyDose_userId_scheduledFor_idx_3a891472',
        columns: ['userId', 'scheduledFor'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'DailyDose',
        index: 'DailyDose_userId_status_idx_e4a128ba',
        columns: ['userId', 'status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ExamAttempt',
        index: 'ExamAttempt_examId_idx_a57bdadd',
        columns: ['examId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ExamAttempt',
        index: 'ExamAttempt_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ExamAttempt',
        index: 'ExamAttempt_userId_status_idx_e4a128ba',
        columns: ['userId', 'status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Faculty',
        index: 'Faculty_isActive_idx_77fe3ba1',
        columns: ['isActive'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'File',
        index: 'File_sha256_idx_ac7e6ff0',
        columns: ['sha256'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'File',
        index: 'File_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'FileAccess',
        index: 'FileAccess_fileId_idx_9a9e456b',
        columns: ['fileId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'FileAccess',
        index: 'FileAccess_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Mistake',
        index: 'Mistake_attemptId_idx_94f50eb9',
        columns: ['attemptId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Mistake',
        index: 'Mistake_questionId_idx_fdb42076',
        columns: ['questionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Mistake',
        index: 'Mistake_recallSessionId_idx_0ea6612d',
        columns: ['recallSessionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Mistake',
        index: 'Mistake_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Mistake',
        index: 'Mistake_userId_resolved_idx_b5c77d5f',
        columns: ['userId', 'resolved'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Profile',
        index: 'Profile_facultyId_idx_ff3b8c32',
        columns: ['facultyId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Progress',
        index: 'Progress_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Progress',
        index: 'Progress_userId_subject_idx_16f0a0ca',
        columns: ['userId', 'subject'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Question',
        index: 'Question_difficulty_idx_ab7b4a75',
        columns: ['difficulty'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Question',
        index: 'Question_isActive_idx_77fe3ba1',
        columns: ['isActive'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Question',
        index: 'Question_subject_idx_4ed0a268',
        columns: ['subject'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Question',
        index: 'Question_topicId_idx_6f05808f',
        columns: ['topicId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Question',
        index: 'Question_topic_idx_655aa1bc',
        columns: ['topic'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'QuestionOption',
        index: 'QuestionOption_questionId_idx_fdb42076',
        columns: ['questionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'RecallSession',
        index: 'RecallSession_dailyDoseId_idx_1f2e1a65',
        columns: ['dailyDoseId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'RecallSession',
        index: 'RecallSession_userId_createdAt_idx_f726f04a',
        columns: ['userId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'RecallSession',
        index: 'RecallSession_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'RecallSession',
        index: 'RecallSession_userId_status_idx_e4a128ba',
        columns: ['userId', 'status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'RecallSessionQuestion',
        index: 'RecallSessionQuestion_questionId_idx_fdb42076',
        columns: ['questionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'RecallSessionQuestion',
        index: 'RecallSessionQuestion_sessionId_idx_29f415d4',
        columns: ['sessionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Session',
        index: 'Session_expiresAt_idx_6b6b8c10',
        columns: ['expiresAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Session',
        index: 'Session_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Subject',
        index: 'Subject_facultyId_idx_ff3b8c32',
        columns: ['facultyId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Subject',
        index: 'Subject_isActive_idx_77fe3ba1',
        columns: ['isActive'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Topic',
        index: 'Topic_isActive_idx_77fe3ba1',
        columns: ['isActive'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Topic',
        index: 'Topic_subjectId_idx_84df2a1d',
        columns: ['subjectId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'User',
        index: 'User_email_idx_46df9cad',
        columns: ['email'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'User',
        index: 'User_role_idx_2c1ddf83',
        columns: ['role'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'WeakSpot',
        index: 'WeakSpot_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'WeakSpot',
        index: 'WeakSpot_userId_isResolved_idx_f4797344',
        columns: ['userId', 'isResolved'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'WeakSpot',
        index: 'WeakSpot_userId_priority_idx_48571828',
        columns: ['userId', 'priority'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Answer',
        foreignKey: {
          name: 'Answer_attemptId_fkey',
          columns: ['attemptId'],
          references: { schema: 'public', table: 'ExamAttempt', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Answer',
        foreignKey: {
          name: 'Answer_recallSessionId_fkey',
          columns: ['recallSessionId'],
          references: { schema: 'public', table: 'RecallSession', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Answer',
        foreignKey: {
          name: 'Answer_questionId_fkey',
          columns: ['questionId'],
          references: { schema: 'public', table: 'Question', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'DailyDose',
        foreignKey: {
          name: 'DailyDose_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ExamAttempt',
        foreignKey: {
          name: 'ExamAttempt_examId_fkey',
          columns: ['examId'],
          references: { schema: 'public', table: 'Exam', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ExamAttempt',
        foreignKey: {
          name: 'ExamAttempt_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'FileAccess',
        foreignKey: {
          name: 'FileAccess_fileId_fkey',
          columns: ['fileId'],
          references: { schema: 'public', table: 'File', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'FileAccess',
        foreignKey: {
          name: 'FileAccess_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Mistake',
        foreignKey: {
          name: 'Mistake_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Mistake',
        foreignKey: {
          name: 'Mistake_questionId_fkey',
          columns: ['questionId'],
          references: { schema: 'public', table: 'Question', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Mistake',
        foreignKey: {
          name: 'Mistake_attemptId_fkey',
          columns: ['attemptId'],
          references: { schema: 'public', table: 'ExamAttempt', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Mistake',
        foreignKey: {
          name: 'Mistake_recallSessionId_fkey',
          columns: ['recallSessionId'],
          references: { schema: 'public', table: 'RecallSession', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Profile',
        foreignKey: {
          name: 'Profile_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Profile',
        foreignKey: {
          name: 'Profile_facultyId_fkey',
          columns: ['facultyId'],
          references: { schema: 'public', table: 'Faculty', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Progress',
        foreignKey: {
          name: 'Progress_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Question',
        foreignKey: {
          name: 'Question_topicId_fkey',
          columns: ['topicId'],
          references: { schema: 'public', table: 'Topic', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'QuestionOption',
        foreignKey: {
          name: 'QuestionOption_questionId_fkey',
          columns: ['questionId'],
          references: { schema: 'public', table: 'Question', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'RecallSession',
        foreignKey: {
          name: 'RecallSession_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'RecallSession',
        foreignKey: {
          name: 'RecallSession_dailyDoseId_fkey',
          columns: ['dailyDoseId'],
          references: { schema: 'public', table: 'DailyDose', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'RecallSessionQuestion',
        foreignKey: {
          name: 'RecallSessionQuestion_sessionId_fkey',
          columns: ['sessionId'],
          references: { schema: 'public', table: 'RecallSession', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'RecallSessionQuestion',
        foreignKey: {
          name: 'RecallSessionQuestion_questionId_fkey',
          columns: ['questionId'],
          references: { schema: 'public', table: 'Question', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Session',
        foreignKey: {
          name: 'Session_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Subject',
        foreignKey: {
          name: 'Subject_facultyId_fkey',
          columns: ['facultyId'],
          references: { schema: 'public', table: 'Faculty', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Topic',
        foreignKey: {
          name: 'Topic_subjectId_fkey',
          columns: ['subjectId'],
          references: { schema: 'public', table: 'Subject', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'WeakSpot',
        foreignKey: {
          name: 'WeakSpot_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
