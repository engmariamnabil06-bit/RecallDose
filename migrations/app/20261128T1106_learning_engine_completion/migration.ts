#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/64e1122326332f0b4bb343b12bdf5035b62d8887ddbcc837a999ca2309877054/contract';
import endContract from '../../snapshots/64e1122326332f0b4bb343b12bdf5035b62d8887ddbcc837a999ca2309877054/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/cbbd9cc1350bdb620a8a546b0529a24a0b13147799051a92405265256658597b/contract';
import startContract from '../../snapshots/cbbd9cc1350bdb620a8a546b0529a24a0b13147799051a92405265256658597b/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'StudyActivity',
        columns: [
          col('activityDate', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
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
          col('questionsAnswered', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('sessionsCompleted', 'int4', {
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
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'StudyCard',
        columns: [
          col('back', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('easeFactor', 'float8', {
            notNull: true,
            default: lit(2.5),
            codecRef: { codecId: 'pg/float8@1' },
          }),
          col('front', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('intervalDays', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('lastRating', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('lastReviewedAt', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('nextReviewAt', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('reviewCount', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('subject', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'StudyNote',
        columns: [
          col('content', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('subject', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'Question',
        column: col('reviewStatus', 'text', {
          notNull: true,
          default: lit('APPROVED'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'Question',
        column: col('reviewedAt', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-temporal@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'Question',
        column: col('reviewedByUserId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'Question',
        column: col('sourcePage', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'Question',
        column: col('sourceReference', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'Question',
        column: col('sourceTitle', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'Question',
        constraint: 'Question_reviewStatus_check_795300dc',
        expression: "\"reviewStatus\" IN ('DRAFT', 'APPROVED', 'ARCHIVED')",
      }),
      this.addUnique({
        schema: 'public',
        table: 'StudyActivity',
        constraint: 'StudyActivity_userId_activityDate_key',
        columns: ['userId', 'activityDate'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'StudyActivity',
        index: 'StudyActivity_userId_activityDate_idx_5e9acfee',
        columns: ['userId', 'activityDate'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'StudyActivity',
        index: 'StudyActivity_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'StudyCard',
        index: 'StudyCard_userId_createdAt_idx_f726f04a',
        columns: ['userId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'StudyCard',
        index: 'StudyCard_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'StudyCard',
        index: 'StudyCard_userId_nextReviewAt_idx_d8d71f0a',
        columns: ['userId', 'nextReviewAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'StudyCard',
        index: 'StudyCard_userId_subject_idx_16f0a0ca',
        columns: ['userId', 'subject'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'StudyNote',
        index: 'StudyNote_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'StudyNote',
        index: 'StudyNote_userId_subject_idx_16f0a0ca',
        columns: ['userId', 'subject'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'StudyNote',
        index: 'StudyNote_userId_updatedAt_idx_42f5280d',
        columns: ['userId', 'updatedAt'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'StudyActivity',
        foreignKey: {
          name: 'StudyActivity_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'StudyCard',
        foreignKey: {
          name: 'StudyCard_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'StudyNote',
        foreignKey: {
          name: 'StudyNote_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
