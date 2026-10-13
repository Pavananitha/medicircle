import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'medicircle_dev_jwt_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  host: process.env.HOST || '0.0.0.0',
  missedDoseGracePeriodMinutes: parseInt(process.env.MISSED_DOSE_GRACE_PERIOD_MINUTES || '30', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  emailUser: process.env.EMAIL_USER || '',
  emailPass: process.env.EMAIL_PASS || '',
};
