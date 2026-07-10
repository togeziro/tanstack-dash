import { describe, expect, it } from 'vitest';
import { users, userStatusEnum, userRoleEnum } from './users';

describe('users schema', () => {
  it('defines the status enum with a default of Active', () => {
    expect(userStatusEnum.enumValues).toEqual(['Active', 'Inactive', 'Invited']);
    expect(users.status.default).toBe('Active');
  });

  it('defines the full role enum', () => {
    expect(userRoleEnum.enumValues).toEqual([
      'Developer',
      'Designer',
      'Manager',
      'QA',
      'DevOps',
      'Product Owner'
    ]);
  });

  it('requires the core identity columns', () => {
    expect(users.first_name.notNull).toBe(true);
    expect(users.last_name.notNull).toBe(true);
    expect(users.email.notNull).toBe(true);
    expect(users.role.notNull).toBe(true);
  });

  it('enforces a unique email', () => {
    expect(users.email.isUnique).toBe(true);
  });

  it('allows a nullable phone', () => {
    expect(users.phone.notNull).toBe(false);
  });
});
