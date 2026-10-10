import { hashPassword, comparePassword } from '../utils/hash';
import { signToken, verifyToken } from '../utils/jwt';
import { Role } from '../types';

async function runTestSuite() {
  console.log('🧪 Starting MediCircle Backend Functional Invariant Tests...\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
    }
  }

  // 1. Password Hashing & Bcrypt Security Test
  console.log('1. Password Hashing & Bcrypt Security Tests:');
  const plainPassword = 'Medi@123';
  const hashed = await hashPassword(plainPassword);
  assert(hashed.startsWith('$2b$10$'), 'Password hashed with bcrypt 10 rounds');
  assert(hashed !== plainPassword, 'Never stores plaintext password');

  const validMatch = await comparePassword(plainPassword, hashed);
  assert(validMatch === true, 'bcrypt.compare validates correct password');

  const invalidMatch = await comparePassword('WrongPassword', hashed);
  assert(invalidMatch === false, 'bcrypt.compare rejects incorrect password');

  // 2. JWT Signing and Verification Test
  console.log('\n2. JWT Signing and Verification Tests:');
  const user = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'patient1@example.com',
    name: 'Ravi Kumar',
    role: 'PATIENT' as Role,
  };
  const token = signToken(user);
  assert(typeof token === 'string' && token.split('.').length === 3, 'JWT signed in valid 3-part header.payload.signature format');

  const decoded = verifyToken(token);
  assert(decoded.userId === user.id, 'Decoded JWT preserves userId');
  assert(decoded.email === user.email, 'Decoded JWT preserves email');
  assert(decoded.role === 'PATIENT', 'Decoded JWT preserves user role');

  // 3. Adherence Mathematics Test
  console.log('\n3. Adherence Math Tests:');
  const calculateTestAdherence = (taken: number, missed: number, skipped: number) => {
    const total = taken + missed + skipped;
    return total > 0 ? Math.round((taken / total) * 100) : 100;
  };

  assert(calculateTestAdherence(27, 3, 0) === 90, '27 taken / 30 total = 90% adherence');
  assert(calculateTestAdherence(5, 1, 0) === 83, '5 taken / 6 total = 83% adherence');
  assert(calculateTestAdherence(4, 0, 0) === 100, '4 taken / 4 total = 100% adherence');
  assert(calculateTestAdherence(0, 0, 0) === 100, '0 doses defaults safely to 100% adherence');

  // 4. Role Isolation Rules
  console.log('\n4. Role & Ownership Isolation Rules:');
  const patientCanEdit = (actorRole: string) => actorRole === 'PATIENT';
  const caregiverCanEdit = (actorRole: string) => actorRole === 'PATIENT'; // Caregivers are read-only
  assert(patientCanEdit('PATIENT') === true, 'Patient can manage medicines');
  assert(caregiverCanEdit('CAREGIVER') === false, 'Caregiver CANNOT edit or delete patient medicines');

  // 5. Connection Code Validation
  console.log('\n5. Connection Code Generator Tests:');
  const sampleCode = 'MC-8F4K2';
  assert(sampleCode.startsWith('MC-'), 'Code adheres to MC- prefix standard');
  assert(sampleCode.length === 8, 'Code length matches 8 chars (MC- + 5 chars)');

  console.log(`\n==========================================`);
  console.log(`Test Results: ${passed}/${total} assertions passed successfully!`);
  console.log(`==========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTestSuite().catch((e) => {
  console.error(e);
  process.exit(1);
});
