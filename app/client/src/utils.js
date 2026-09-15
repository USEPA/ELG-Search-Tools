// vue-select filters on the option's `label` field, not on what the #option slot renders,
// so a category rendered as "405: Dairy Products Processing" only matches on the name.
// Matches against the rendered text instead; pass a null code for options that render the name alone.
export function matchesCodeOrName(code, name, search) {
  const renderedText = code === null || code === undefined ? `${name ?? ''}` : `${code}: ${name ?? ''}`;
  return renderedText.toLowerCase().includes(search.trim().toLowerCase());
}
