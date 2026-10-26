/**
 * Phase 1 Foundation & Scoping Verification Suite
 * Verifies design tokens, currency formatting, class merging, and tenant isolation predicates.
 */

import assert from 'node:assert';
import { formatNaira, cn } from '../packages/ui/src/lib/utils';
import tailwindConfig from '../packages/config/tailwind.config.js';
import { getScopedDb } from '../packages/db/src/client';

console.log('--- Running Phase 1 Foundation Verification Suite ---');

// Test 1: Design Tokens Verification
console.log('Test 1: Verifying SchoolOS Tailwind design tokens...');
assert(tailwindConfig.theme.extend.colors.navy, 'Missing navy color token');
assert.strictEqual(tailwindConfig.theme.extend.colors.navy[950], '#0B132B', 'Invalid navy-950 hex value');
assert(tailwindConfig.theme.extend.colors.emerald, 'Missing emerald color token');
assert.strictEqual(tailwindConfig.theme.extend.colors.emerald[600], '#059669', 'Invalid emerald-600 hex value');
console.log('✓ Test 1 Passed: SchoolOS Institutional color tokens correctly configured.');

// Test 2: Nigerian Naira Currency Formatting
console.log('Test 2: Verifying formatNaira helper...');
const formattedZero = formatNaira(0);
assert(formattedZero.includes('0.00'), `Expected ₦0.00 but got ${formattedZero}`);
const formattedAmount = formatNaira(245000);
assert(formattedAmount.includes('245,000.00'), `Expected 245,000.00 in ${formattedAmount}`);
const formattedInvalid = formatNaira('invalid');
assert(formattedInvalid.includes('0.00'), 'Expected fallback for NaN');
console.log('✓ Test 2 Passed: Currency formatting strictly adheres to NGN localization.');

// Test 3: Tailwind Class Merging Utility (cn)
console.log('Test 3: Verifying cn utility...');
const merged = cn('px-4 py-2 text-sm', 'px-6', { 'bg-emerald-600': true, 'bg-rose-500': false });
assert(merged.includes('px-6'), 'px-6 should override px-4');
assert(!merged.includes('px-4'), 'px-4 should be purged by tailwind-merge');
assert(merged.includes('bg-emerald-600'), 'Conditional true class should be present');
assert(!merged.includes('bg-rose-500'), 'Conditional false class should be absent');
console.log('✓ Test 3 Passed: Tailwind utility class merging functions deterministically.');

// Test 4: Tenant Scoping Guardrail Verification
console.log('Test 4: Verifying getScopedDb tenant isolation guard...');
assert.throws(
  () => {
    // @ts-expect-error Testing missing schoolId
    getScopedDb('');
  },
  /Tenant scoping error: schoolId is required/,
  'Expected getScopedDb to throw if schoolId is missing'
);

const testSchoolId = '123e4567-e89b-12d3-a456-426614174000';
const scopedClient = getScopedDb(testSchoolId);
assert(scopedClient, 'Expected scoped client extension to be instantiated');
console.log('✓ Test 4 Passed: Tenant scoping engine rejects un-scoped queries.');

console.log('========================================================');
console.log('ALL PHASE 1 FOUNDATION TESTS PASSED (4/4)');
console.log('========================================================');
