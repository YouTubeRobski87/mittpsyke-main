const supportData = require('./supportData.json');

function normalizeCategory(category) {
  if (!category) return '';
  if (category === 'psykisk-halsa') return 'psykiskhalsa';
  return category;
}

function normalizeTags(tags) {
  const normalized = new Set((tags ?? []).filter(Boolean));

  if (normalized.has('vald')) normalized.add('valdbrott');
  if (normalized.has('sorg') || normalized.has('trauma')) normalized.add('sorgtrauma');

  return Array.from(normalized);
}

module.exports = () => {
  return (supportData ?? [])
    .filter((item) => item && item.active !== false)
    .map((item) => ({
      id: item.id,
      name: item.title,
      url: item.resource?.url,
      number: item.phone,
      description: item.description,
      category: normalizeCategory(item.category),
      available: item.availability?.label ?? '',
      urgent: Boolean(item.urgent),
      tags: normalizeTags(item.tags),
      contactTypes: item.contactTypes ?? [],
      lastVerified: item.lastVerified
    }));
};
