// Random şifrə generatoru
export const generateRandomPassword = (length: number = 12): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  
  // Hər kateqoriyadan ən az 1 simvol
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Qalan simvolları random əlavə et
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Qarışdır
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
};

// Şifrə gücünü yoxla
export const checkPasswordStrength = (password: string): {
  score: number;
  label: 'weak' | 'medium' | 'strong' | 'very-strong';
} => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  const label = score <= 2 ? 'weak' : score <= 4 ? 'medium' : score <= 5 ? 'strong' : 'very-strong';
  
  return { score, label };
};