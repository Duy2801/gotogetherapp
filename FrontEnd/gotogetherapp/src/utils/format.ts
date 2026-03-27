/**
 * Format số tiền VND theo dạng đầy đủ với dấu phân cách: 1.500.000 đ
 */
export const formatCurrency = (value: number): string =>
  `${Math.round(value).toLocaleString('vi-VN')} đ`;

/**
 * Format số tiền VND không có khoảng trắng trước "đ": 1.500.000đ
 */
export const formatMoney = (value: number): string =>
  `${Math.round(value).toLocaleString('vi-VN')}đ`;

/**
 * Format số tiền gọn: 1.5M, 500k, 1.2B, v.v.
 */
export const formatCompactMoney = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1).replace('.0', '')}B`;
  }
  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace('.0', '')}M`;
  }
  if (abs >= 1_000) {
    return `${(value / 1_000).toFixed(0)}k`;
  }
  return `${Math.round(value)}`;
};

/**
 * Format số tiền thô (chỉ số, có dấu phân cách) để hiển thị trong TextInput:
 * "1500000" → "1.500.000"
 */
export const formatAmountInput = (raw: string): string => {
  const cleaned = raw.replace(/[^0-9]/g, '');
  if (!cleaned) return '';
  return parseInt(cleaned).toLocaleString('vi-VN');
};

/**
 * Format ngày tháng theo định dạng Việt Nam: dd/mm/yyyy
 */
export const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
