import { PrismaClient, Role, FrequencyType, LogStatus, ConnectionStatus, NotificationType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Prisma database seeding for MediCircle...');

  // Hash password Medi@123
  const passwordHash = await bcrypt.hash('Medi@123', 10);

  // Clean existing tables in reverse dependency order
  await prisma.notificationDevice.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.connectionCode.deleteMany({});
  await prisma.caregiverConnection.deleteMany({});
  await prisma.medicationLog.deleteMany({});
  await prisma.medicineSchedule.deleteMany({});
  await prisma.medicine.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Patient 1: Ravi Kumar
  const patient1 = await prisma.user.create({
    data: {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Ravi Kumar',
      email: 'patient1@example.com',
      phone: '+91-9876543210',
      password_hash: passwordHash,
      role: Role.PATIENT,
      date_of_birth: new Date('1985-06-15'),
      gender: 'Male',
      emergency_contact_name: 'Suresh Kumar',
      emergency_contact_phone: '+91-9876543212',
    },
  });

  // 2. Create Patient 2: Priya Sharma
  const patient2 = await prisma.user.create({
    data: {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Priya Sharma',
      email: 'patient2@example.com',
      phone: '+91-9876543211',
      password_hash: passwordHash,
      role: Role.PATIENT,
      date_of_birth: new Date('1992-11-20'),
      gender: 'Female',
      emergency_contact_name: 'Anita Patel',
      emergency_contact_phone: '+91-9876543213',
    },
  });

  // 3. Create Caregiver 1: Suresh Kumar
  const caregiver1 = await prisma.user.create({
    data: {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Suresh Kumar',
      email: 'caregiver1@example.com',
      phone: '+91-9876543212',
      password_hash: passwordHash,
      role: Role.CAREGIVER,
      date_of_birth: new Date('1980-04-10'),
      gender: 'Male',
      emergency_contact_name: 'Ravi Kumar',
      emergency_contact_phone: '+91-9876543210',
    },
  });

  // 4. Create Caregiver 2: Anita Patel
  const caregiver2 = await prisma.user.create({
    data: {
      id: '44444444-4444-4444-4444-444444444444',
      name: 'Anita Patel',
      email: 'caregiver2@example.com',
      phone: '+91-9876543213',
      password_hash: passwordHash,
      role: Role.CAREGIVER,
      date_of_birth: new Date('1988-09-25'),
      gender: 'Female',
      emergency_contact_name: 'Priya Sharma',
      emergency_contact_phone: '+91-9876543211',
    },
  });

  // 5. Create Medicines for Patient 1
  const paracetamol = await prisma.medicine.create({
    data: {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      patient_id: patient1.id,
      name: 'Paracetamol',
      generic_name: 'Acetaminophen',
      dosage: '500',
      dosage_unit: 'mg',
      medicine_type: 'Tablet',
      instructions: 'Take after meals with water',
      start_date: new Date(Date.now() - 14 * 86400000),
      end_date: new Date(Date.now() + 30 * 86400000),
      notes: 'Prescribed for mild fever and pain',
    },
  });

  const vitaminD = await prisma.medicine.create({
    data: {
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      patient_id: patient1.id,
      name: 'Vitamin D3',
      generic_name: 'Cholecalciferol',
      dosage: '1000',
      dosage_unit: 'IU',
      medicine_type: 'Capsule',
      instructions: 'Take in the morning with milk',
      start_date: new Date(Date.now() - 30 * 86400000),
      end_date: new Date(Date.now() + 60 * 86400000),
      notes: 'Daily nutritional supplement',
    },
  });

  // 6. Create Schedules
  const schedule8am = await prisma.medicineSchedule.create({
    data: {
      id: 's1111111-1111-1111-1111-111111111111',
      medicine_id: paracetamol.id,
      schedule_time: new Date('1970-01-01T08:00:00Z'),
      frequency_type: FrequencyType.DAILY,
      days_of_week: 'MON,TUE,WED,THU,FRI,SAT,SUN',
    },
  });

  const schedule2pm = await prisma.medicineSchedule.create({
    data: {
      id: 's1111111-1111-1111-1111-111111111112',
      medicine_id: paracetamol.id,
      schedule_time: new Date('1970-01-01T14:00:00Z'),
      frequency_type: FrequencyType.DAILY,
      days_of_week: 'MON,TUE,WED,THU,FRI,SAT,SUN',
    },
  });

  const schedule8pm = await prisma.medicineSchedule.create({
    data: {
      id: 's1111111-1111-1111-1111-111111111113',
      medicine_id: paracetamol.id,
      schedule_time: new Date('1970-01-01T20:00:00Z'),
      frequency_type: FrequencyType.DAILY,
      days_of_week: 'MON,TUE,WED,THU,FRI,SAT,SUN',
    },
  });

  const scheduleVitD9am = await prisma.medicineSchedule.create({
    data: {
      id: 's2222222-2222-2222-2222-222222222221',
      medicine_id: vitaminD.id,
      schedule_time: new Date('1970-01-01T09:00:00Z'),
      frequency_type: FrequencyType.DAILY,
      days_of_week: 'MON,TUE,WED,THU,FRI,SAT,SUN',
    },
  });

  // 7. Create Medication Logs for Today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.medicationLog.createMany({
    data: [
      {
        id: 'l1111111-1111-1111-1111-111111111111',
        patient_id: patient1.id,
        medicine_id: vitaminD.id,
        schedule_id: scheduleVitD9am.id,
        scheduled_date: today,
        scheduled_time: new Date('1970-01-01T09:00:00Z'),
        action_time: new Date(Date.now() - 11 * 3600000),
        status: LogStatus.TAKEN,
      },
      {
        id: 'l1111111-1111-1111-1111-111111111112',
        patient_id: patient1.id,
        medicine_id: paracetamol.id,
        schedule_id: schedule8am.id,
        scheduled_date: today,
        scheduled_time: new Date('1970-01-01T08:00:00Z'),
        action_time: new Date(Date.now() - 12 * 3600000),
        status: LogStatus.TAKEN,
      },
      {
        id: 'l1111111-1111-1111-1111-111111111113',
        patient_id: patient1.id,
        medicine_id: paracetamol.id,
        schedule_id: schedule2pm.id,
        scheduled_date: today,
        scheduled_time: new Date('1970-01-01T14:00:00Z'),
        action_time: null,
        status: LogStatus.MISSED,
      },
      {
        id: 'l1111111-1111-1111-1111-111111111114',
        patient_id: patient1.id,
        medicine_id: paracetamol.id,
        schedule_id: schedule8pm.id,
        scheduled_date: today,
        scheduled_time: new Date('1970-01-01T20:00:00Z'),
        action_time: null,
        status: LogStatus.PENDING,
      },
    ],
  });

  // 8. Create Caregiver Connection
  await prisma.caregiverConnection.create({
    data: {
      id: 'c1111111-1111-1111-1111-111111111111',
      patient_id: patient1.id,
      caregiver_id: caregiver1.id,
      status: ConnectionStatus.ACTIVE,
      requested_at: new Date(Date.now() - 7 * 86400000),
      approved_at: new Date(Date.now() - 7 * 86400000),
    },
  });

  // 9. Create Connection Code
  await prisma.connectionCode.create({
    data: {
      id: 'cc111111-1111-1111-1111-111111111111',
      patient_id: patient1.id,
      code: 'MC-8F4K2',
      expires_at: new Date(Date.now() + 24 * 3600000),
      is_active: true,
    },
  });

  // 10. Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        id: 'n1111111-1111-1111-1111-111111111111',
        user_id: patient1.id,
        type: NotificationType.MEDICINE_REMINDER,
        title: 'Time to take your medication',
        message: 'Time to take Paracetamol 500 mg (Scheduled at 08:00 PM).',
        related_entity_id: paracetamol.id,
        is_read: false,
      },
      {
        id: 'n2222222-2222-2222-2222-222222222222',
        user_id: caregiver1.id,
        type: NotificationType.MISSED_DOSE,
        title: 'Missed Medication Alert',
        message: 'Ravi Kumar missed: Paracetamol 500 mg Scheduled: 02:00 PM.',
        related_entity_id: paracetamol.id,
        is_read: false,
      },
    ],
  });

  console.log('✅ MediCircle database successfully seeded!');
  console.log('   Patient 1: patient1@example.com (Password: Medi@123)');
  console.log('   Caregiver 1: caregiver1@example.com (Password: Medi@123)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
