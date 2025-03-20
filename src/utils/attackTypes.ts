// Shared list of attack types for consistent display across components
export const ATTACK_TYPES = [
  'SQL Injection',
  'XSS',
  'DDOS',
  'Ransomware'
] as const;

export type AttackType = typeof ATTACK_TYPES[number];

// Function to transform unknown attack types to known types
export const transformAttackType = (attackType: string, id: string): AttackType => {
  if (!attackType || attackType.toLowerCase() === 'unknown') {
    // Deterministically choose an attack type based on the ID
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return ATTACK_TYPES[hash % ATTACK_TYPES.length];
  }
  
  // If the attack type is already in our list, return it
  if (ATTACK_TYPES.includes(attackType as AttackType)) {
    return attackType as AttackType;
  }
  
  // For any other attack type, map it to one of our standard types
  const hash = attackType.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return ATTACK_TYPES[hash % ATTACK_TYPES.length];
}; 