import Toast from 'react-native-toast-message';
import store from '../reducers/store';
import { t as i18nT, Locale } from '../i18n';

type ToastKind = 'success' | 'error' | 'info';

type ShowAppToastParams = {
  kind?: ToastKind;
  title: string;
  message?: string;
  duration?: number;
};

const translateErrorMessageToVi = (message?: string): string | undefined => {
  if (!message) {
    return message;
  }

  let translated = message.trim();
  if (!translated) {
    return translated;
  }

  const exactMap: Record<string, string> = {
    'email must be an email': 'Email không đúng định dạng.',
    'validation failed': 'Dữ liệu không hợp lệ.',
    'upload failed': 'Tải lên thất bại.',
    'internal server error': 'Lỗi máy chủ nội bộ.',
    'forbidden resource': 'Bạn không có quyền thực hiện thao tác này.',
    unauthorized: 'Bạn cần đăng nhập để thực hiện thao tác này.',
  };

  const lower = translated.toLowerCase();
  if (exactMap[lower]) {
    return exactMap[lower];
  }

  const replacements: Array<[RegExp, string]> = [
    [/must be an email/gi, 'không đúng định dạng email'],
    [/must be a string/gi, 'phải là chuỗi'],
    [/must be a number/gi, 'phải là số'],
    [/must be a boolean/gi, 'phải là kiểu đúng/sai'],
    [/should not be empty/gi, 'không được để trống'],
    [
      /must be longer than or equal to (\d+) characters/gi,
      'phải có ít nhất $1 ký tự',
    ],
    [
      /must be shorter than or equal to (\d+) characters/gi,
      'phải có tối đa $1 ký tự',
    ],
    [
      /must be one of the following values: (.*)/gi,
      'phải thuộc một trong các giá trị: $1',
    ],
    [/invalid/gi, 'không hợp lệ'],
    [/required/gi, 'bắt buộc'],
  ];

  replacements.forEach(([pattern, replacement]) => {
    translated = translated.replace(pattern, replacement);
  });

  if (
    translated.includes('email') &&
    translated.includes('không đúng định dạng')
  ) {
    translated = translated.replace(/email/gi, 'Email');
  }

  return translated;
};

const toastThemeByKind: Record<
  ToastKind,
  { backgroundColor: string; toastAssetKey: string }
> = {
  success: {
    backgroundColor: '#10B981',
    toastAssetKey: 'SUCCESS',
  },
  error: {
    backgroundColor: '#EF4444',
    toastAssetKey: 'ERROR',
  },
  info: {
    backgroundColor: '#3B82F6',
    toastAssetKey: 'NOTIFICATION',
  },
};

export const showAppToast = ({
  kind = 'info',
  title,
  message,
  duration = 3000,
}: ShowAppToastParams) => {
  const theme = toastThemeByKind[kind];

  Toast.show({
    type: 'notification',
    position: 'top',
    visibilityTime: duration,
    topOffset: 40,
    text1: title,
    text2: message,
    props: {
      backgroundColor: theme.backgroundColor,
      toastAssetKey: theme.toastAssetKey,
      onClose: () => Toast.hide(),
    },
  });
};

export const showSuccessToast = (
  title: string,
  message?: string,
  duration?: number,
) => showAppToast({ kind: 'success', title, message, duration });

export const showErrorToast = (
  title: string,
  message?: string,
  duration?: number,
) =>
  showAppToast({
    kind: 'error',
    title,
    message: translateErrorMessageToVi(message),
    duration,
  });

export const showInfoToast = (
  title: string,
  message?: string,
  duration?: number,
) => showAppToast({ kind: 'info', title, message, duration });

// Centralized action messages in Vietnamese for common actions.
export const ACTION_MESSAGES: Record<string, string> = {
  loginSuccess: 'Đăng nhập thành công.',
  logoutSuccess: 'Đăng xuất thành công.',
  passwordResetSuccess:
    'Đổi mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.',
  passwordChangeSuccess: 'Thay đổi mật khẩu thành công.',
  sendOtpSuccess: 'Đã gửi mã xác thực tới email của bạn.',
  verifyOtpSuccess: 'Xác thực thành công.',
  registerSuccess: 'Đăng ký thành công. Vui lòng đăng nhập.',
  tripCreateSuccess: 'Thêm chuyến đi thành công.',
  tripUpdateSuccess: 'Cập nhật chuyến đi thành công.',
  tripDeleteSuccess: 'Xóa chuyến đi thành công.',
  expenseCreateSuccess: 'Thêm chi tiêu thành công.',
  genericSuccess: 'Thao tác thành công.',
};

/**
 * Show a standard success toast for a named action.
 * @param actionKey key from ACTION_MESSAGES
 * @param override optional custom message to override the default
 */
export const showActionSuccessMessage = (
  actionKey: keyof typeof ACTION_MESSAGES | string,
  override?: string,
  duration?: number,
) => {
  const locale = store.getState().locale as Locale;
  const message =
    override ?? i18nT(locale, `actions.${actionKey}`) ?? ACTION_MESSAGES[actionKey] ?? i18nT(locale, 'common.success');
  return showSuccessToast(i18nT(locale, 'common.success'), message, duration);
};

/**
 * Show a standard error toast for a named action.
 * If server message exists, it will be translated to Vietnamese where possible.
 */
export const showActionErrorMessage = (
  actionKey: string,
  serverMessage?: string,
  duration?: number,
) => {
  const locale = store.getState().locale as Locale;
  const defaultMsg =
    i18nT(locale, `actions.${actionKey}.error`) ||
    (ACTION_MESSAGES[actionKey] ? `${ACTION_MESSAGES[actionKey]} thất bại.` : i18nT(locale, 'common.error'));
  const translated = translateErrorMessageToVi(serverMessage) ?? defaultMsg;
  return showErrorToast(i18nT(locale, 'common.error'), translated, duration);
};
