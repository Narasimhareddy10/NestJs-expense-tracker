// Category icons mapping based on icon names from backend
const CATEGORY_ICONS: Record<string, string> = {
  food: '🍔',
  burger: '🍔',
  car: '🚗',
  shopping: '🛒',
  cart: '🛒',
  home: '🏠',
  house: '🏠',
  lightbulb: '💡',
  utilities: '💡',
  book: '📚',
  education: '📚',
  film: '🎬',
  entertainment: '🎬',
  heart: '❤️',
  healthcare: '🩺',
  stethoscope: '🩺',
  shield: '🛡️',
  insurance: '🛡️',
  piggy: '🐷',
  savings: '💰',
  money: '💰',
  plane: '✈️',
  travel: '✈️',
  sparkles: '✨',
  personal: '💅',
  gift: '🎁',
  other: '📦',
  box: '📦',
  dollar: '💵',
  credit: '💳',
  card: '💳',
  music: '🎵',
  camera: '📷',
  pets: '🐾',
  paw: '🐾',
  coffee: '☕',
  gamepad: '🎮',
  games: '🎮',
  gym: '🏋️',
  fitness: '🏋️',
  phone: '📱',
  laptop: '💻',
  tech: '💻',
};

export const getCategoryIcon = (icon: string | null | undefined): string => {
  if (!icon) return '📦';

  const lowerIcon = icon.toLowerCase();

  // Check for direct match
  if (CATEGORY_ICONS[lowerIcon]) {
    return CATEGORY_ICONS[lowerIcon];
  }

  // Check if icon string contains any known key
  for (const [key, emoji] of Object.entries(CATEGORY_ICONS)) {
    if (lowerIcon.includes(key)) {
      return emoji;
    }
  }

  // If icon is already an emoji, return it
  if (/\p{Emoji}/u.test(icon)) {
    return icon;
  }

  return '📦';
};

// Available icons for category creation
export const AVAILABLE_ICONS = [
  { id: 'burger', emoji: '🍔', name: 'Food' },
  { id: 'car', emoji: '🚗', name: 'Transport' },
  { id: 'cart', emoji: '🛒', name: 'Shopping' },
  { id: 'home', emoji: '🏠', name: 'Home' },
  { id: 'lightbulb', emoji: '💡', name: 'Utilities' },
  { id: 'book', emoji: '📚', name: 'Education' },
  { id: 'film', emoji: '🎬', name: 'Entertainment' },
  { id: 'heart', emoji: '❤️', name: 'Healthcare' },
  { id: 'plane', emoji: '✈️', name: 'Travel' },
  { id: 'sparkles', emoji: '✨', name: 'Personal' },
  { id: 'money', emoji: '💰', name: 'Savings' },
  { id: 'shield', emoji: '🛡️', name: 'Insurance' },
  { id: 'gift', emoji: '🎁', name: 'Gifts' },
  { id: 'music', emoji: '🎵', name: 'Music' },
  { id: 'camera', emoji: '📷', name: 'Photography' },
  { id: 'pets', emoji: '🐾', name: 'Pets' },
  { id: 'coffee', emoji: '☕', name: 'Coffee' },
  { id: 'gamepad', emoji: '🎮', name: 'Games' },
  { id: 'gym', emoji: '🏋️', name: 'Fitness' },
  { id: 'credit', emoji: '💳', name: 'Card' },
  { id: 'target', emoji: '🎯', name: 'Goals' },
  { id: 'other', emoji: '📦', name: 'Other' },
];
