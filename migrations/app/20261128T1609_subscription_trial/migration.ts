#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/9e6d4d170678be8225b05c7c63f4b54e4827902b1b2c19b39b0acd5f0be03413/contract';
import endContract from '../../snapshots/9e6d4d170678be8225b05c7c63f4b54e4827902b1b2c19b39b0acd5f0be03413/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/a6f21d59de952118c8726b26643719ea687d1673ef6f235c69f3ab64922207d8/contract';
import startContract from '../../snapshots/a6f21d59de952118c8726b26643719ea687d1673ef6f235c69f3ab64922207d8/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'Subscription',
        columns: [
          col('billingCycle', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('currentPeriodEnd', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('currentPeriodStart', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('paymentProvider', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('plan', 'text', {
            notNull: true,
            default: lit('FREE_TRIAL'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('providerReference', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('TRIALING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('trialEndsAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('trialStartedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Subscription_paymentProvider_check_ccddf3b0',
            "\"paymentProvider\" IN ('FAWRY_PLUS', 'ORANGE_WALLET')",
          ),
          checkExpression(
            'Subscription_plan_check_28ec3c30',
            "\"plan\" IN ('FREE_TRIAL', 'FREE', 'PLUS', 'PRO')",
          ),
          checkExpression(
            'Subscription_status_check_f4436f66',
            "\"status\" IN ('TRIALING', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING_PAYMENT')",
          ),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Subscription',
        constraint: 'Subscription_userId_key',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Subscription',
        index: 'Subscription_plan_idx_0cb3f94a',
        columns: ['plan'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Subscription',
        index: 'Subscription_status_trialEndsAt_idx_429d45c6',
        columns: ['status', 'trialEndsAt'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Subscription',
        foreignKey: {
          name: 'Subscription_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
