export const formatCurrency = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
};

export const formatDateInput = (date: string | Date): string => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

export const formatMonth = (month: number, year: number): string => {
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
  }).format(date);
};

export const getCurrentMonth = (): number => {
  return new Date().getMonth() + 1;
};

export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};
