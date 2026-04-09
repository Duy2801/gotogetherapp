import { ONBOARDING } from '../../assets';

export const getOnboardingData = (locale: string) => {
  if (locale === 'en') {
    return [
      {
        id: '1',
        image: ONBOARDING.STEP1,
        image2: ONBOARDING.STEP2,
        title: 'A more meaningful journey together',
        description: 'Focus on enjoying the trip while we handle the spending.',
        button: 'Get started',
        LoginRedirectText: 'Log in',
      },
      {
        id: '2',
        image: ONBOARDING.STEP3,
        title: 'Track together',
        description: 'Record spending in real time so nobody is left out.',
        button: 'Continue',
      },
      {
        id: '3',
        image: ONBOARDING.STEP4,
        title: 'Split fairly',
        description:
          'The app calculates exactly who paid how much so everyone stays clear.',
        button: 'Continue',
      },
      {
        id: '4',
        image: ONBOARDING.STEP5,
        image2: ONBOARDING.STEP6,
        title: 'Transparent spending insights',
        description:
          'Get clear spending reports by day and category to manage your budget better.',
        button: 'Start now',
      },
    ];
  }

  return [
    {
      id: '1',
      image: ONBOARDING.STEP1,
      image2: ONBOARDING.STEP2,
      title: 'Hành trình ý nghĩa hơn khi có nhau',
      description: 'Tập trung tận hưởng, để chúng tôi lo chi tiêu.',
      button: 'Bắt đầu nào',
      LoginRedirectText: 'Đăng nhập',
    },
    {
      id: '2',
      image: ONBOARDING.STEP3,
      title: 'Theo dõi cùng nhau',
      description: 'Ghi chi tiêu theo thời gian thực để không ai bị bỏ sót.',
      button: 'Tiếp tục',
    },
    {
      id: '3',
      image: ONBOARDING.STEP4,
      title: 'Chia đều, công bằng',
      description:
        'Ứng dụng tự động tính chính xác ai trả bao nhiêu, rõ ràng cho mọi người.',
      button: 'Tiếp tục',
    },
    {
      id: '4',
      image: ONBOARDING.STEP5,
      image2: ONBOARDING.STEP6,
      title: 'Thống kê minh bạch từng xu',
      description:
        'Ứng dụng cung cấp báo cáo chi tiêu rõ ràng theo ngày và danh mục, giúp bạn quản lý ngân sách tối ưu.',
      button: 'Bắt đầu ngay',
    },
  ];
};
