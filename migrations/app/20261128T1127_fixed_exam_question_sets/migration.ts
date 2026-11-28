#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/64e1122326332f0b4bb343b12bdf5035b62d8887ddbcc837a999ca2309877054/contract';
import startContract from '../../snapshots/64e1122326332f0b4bb343b12bdf5035b62d8887ddbcc837a999ca2309877054/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/a6f21d59de952118c8726b26643719ea687d1673ef6f235c69f3ab64922207d8/contract';
import endContract from '../../snapshots/a6f21d59de952118c8726b26643719ea687d1673ef6f235c69f3ab64922207d8/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'ExamQuestion',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('examId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('questionId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('questionOrder', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'ExamQuestion',
        constraint: 'ExamQuestion_examId_questionId_key',
        columns: ['examId', 'questionId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'ExamQuestion',
        constraint: 'ExamQuestion_examId_questionOrder_key',
        columns: ['examId', 'questionOrder'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ExamQuestion',
        index: 'ExamQuestion_examId_idx_a57bdadd',
        columns: ['examId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ExamQuestion',
        index: 'ExamQuestion_questionId_idx_fdb42076',
        columns: ['questionId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ExamQuestion',
        foreignKey: {
          name: 'ExamQuestion_examId_fkey',
          columns: ['examId'],
          references: { schema: 'public', table: 'Exam', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ExamQuestion',
        foreignKey: {
          name: 'ExamQuestion_questionId_fkey',
          columns: ['questionId'],
          references: { schema: 'public', table: 'Question', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
