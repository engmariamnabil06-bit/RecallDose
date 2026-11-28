#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/950f5b1bbd7028915d8c9772db39543764ee6b1be22ff835cf548c254f4fa7f6/contract';
import endContract from '../../snapshots/950f5b1bbd7028915d8c9772db39543764ee6b1be22ff835cf548c254f4fa7f6/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/cbbd9cc1350bdb620a8a546b0529a24a0b13147799051a92405265256658597b/contract';
import startContract from '../../snapshots/cbbd9cc1350bdb620a8a546b0529a24a0b13147799051a92405265256658597b/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
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
          col('front', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
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
