export const validateCkbAddress = (address: string): boolean => {
  if (!address) return false;
  return /^(ckt1|ckb1)[qzpry9x8gf2tvdw0s3jn54khce6mua7l]{40,}$/i.test(address);
};

export const validateCkbAmount = (amount: string): { isValid: boolean; error: string | null } => {
  if (!amount) return { isValid: false, error: null }; // Empty is invalid, but don't yell at the user yet
  
  const num = Number(amount);
  
  if (isNaN(num)) {
    return { isValid: false, error: "Please enter a valid number." };
  }
  if (num <= 0) {
    return { isValid: false, error: "Amount must be greater than 0." };
  }
  // The CKB "Cell Space" rule
  if (num > 0 && num < 61) {
    return { isValid: false, error: "Minimum transfer is 61 CKB to create a recipient cell." };
  }
  
  return { isValid: true, error: null };
};