/**
 * Format số tiền VND theo dạng đầy đủ với dấu phân cách: 1.500.000 đ
 */
const formatNumberSmart = (value: number): string => {
  const v = Number(value || 0);
  // If integer, show no decimals; otherwise show up to 2 decimals (trim trailing zeros)
  if (Number.isInteger(v)) {
    return v.toLocaleString('vi-VN');
  }
  return v.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
};

export const formatCurrency = (value: number): string =>
  `${formatNumberSmart(value)} đ`;

/**
 * Format số tiền VND không có khoảng trắng trước "đ": 1.500.000đ
 */
export const formatMoney = (value: number): string => `${formatNumberSmart(value)}đ`;

/**
 * Format số tiền gọn: 1.5M, 500k, 1.2B, v.v.
 */
export const formatCompactMoney = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    return `${Number(value / 1_000_000_000).toLocaleString('vi-VN', {
      maximumFractionDigits: 2,
    })}B`;
  }
  if (abs >= 1_000_000) {
    return `${Number(value / 1_000_000).toLocaleString('vi-VN', {
      maximumFractionDigits: 2,
    })}M`;
  }
  if (abs >= 1_000) {
    return `${Number(value / 1_000).toLocaleString('vi-VN', {
      maximumFractionDigits: 2,
    })}k`;
  }
  return formatNumberSmart(value);
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
