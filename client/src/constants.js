export const UNIT_GROUPS = [
  {
    label: 'Volume',
    units: [
      { value: 'ml', label: 'ml (mililiter)' },
      { value: 'liter', label: 'liter' },
      { value: 'gelas', label: 'gelas' },
      { value: 'cangkir', label: 'cangkir' },
      { value: 'sdm', label: 'sdm (sendok makan)' },
      { value: 'sdt', label: 'sdt (sendok teh)' },
      { value: 'tetes', label: 'tetes' },
    ],
  },
  {
    label: 'Berat',
    units: [
      { value: 'gram', label: 'gram (gr)' },
      { value: 'kg', label: 'kilogram (kg)' },
      { value: 'ons', label: 'ons' },
      { value: 'pon', label: 'pon' },
    ],
  },
  {
    label: 'Hitungan',
    units: [
      { value: 'buah', label: 'buah' },
      { value: 'butir', label: 'butir' },
      { value: 'iris', label: 'iris' },
      { value: 'lembar', label: 'lembar' },
      { value: 'batang', label: 'batang' },
      { value: 'ruas', label: 'ruas' },
      { value: 'helai', label: 'helai' },
      { value: 'tangkai', label: 'tangkai' },
      { value: 'siung', label: 'siung' },
      { value: 'potong', label: 'potong' },
    ],
  },
  {
    label: 'Lainnya',
    units: [
      { value: 'secukupnya', label: 'secukupnya' },
      { value: 'sachet', label: 'sachet' },
      { value: 'bungkus', label: 'bungkus' },
    ],
  },
];

export const ALL_UNITS = UNIT_GROUPS.flatMap((g) => g.units);

export function formatIngredient(ing) {
  if (typeof ing === 'string') return ing;
  const parts = [];
  if (ing.amount) parts.push(ing.amount);
  if (ing.unit) parts.push(ing.unit);
  if (ing.name) parts.push(ing.name);
  return parts.join(' ') || ing.name || '';
}

export function parseLegacyIngredient(ing) {
  if (typeof ing === 'string') return { amount: '', unit: '', name: ing };
  if (ing.unit !== undefined) return ing;
  if (ing.amount) {
    const match = ing.amount.match(/^([\d.,\/]+)\s*(.*)$/);
    if (match) {
      return { amount: match[1], unit: match[2] || '', name: ing.name || '' };
    }
    return { amount: '', unit: ing.amount, name: ing.name || '' };
  }
  return { amount: '', unit: '', name: ing.name || '' };
}
