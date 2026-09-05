const normalizeWords = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Match complete place names: "Ica" must not match "amazónica". */
export const matchesDestination = (value: string, term: string): boolean => {
  const normalizedTerm = normalizeWords(term);
  return normalizedTerm.length > 0 && ` ${normalizeWords(value)} `.includes(` ${normalizedTerm} `);
};
