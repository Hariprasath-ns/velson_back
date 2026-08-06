export const getFinancialYear = (date = new Date()) => {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const y1 = month >= 4 ? year : year - 1;
  return `${String(y1).slice(-2)}-${String(y1 + 1).slice(-2)}`;
};
