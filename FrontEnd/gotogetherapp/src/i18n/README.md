# i18n - Internationalization Setup

Hệ thống đa ngôn ngữ cho GoTogether App. Hỗ trợ Tiếng Việt (vi) và Tiếng Anh (en).

## Frontend Setup

### Sử dụng Hook `useTranslation`

```tsx
import { useTranslation } from '../../hooks/useTranslation';

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t('common.hello')}</Text>
      <Text>{t('auth.login')}</Text>
    </View>
  );
};
```

### Các Standalone Function

```tsx
import { t } from '../../i18n';

// Get translation
const message = t('vi', 'auth.login');

// Get translation with parameters
const errorMsg = t('en', 'validation.required', { field: 'Email' });
// Output: "Please enter Email"
```

### Cấu trúc Key

Translations được tổ chức theo namespace:

- `common.*` - Các từ chung
- `auth.*` - Xác thực
- `home.*` - Home screen
- `trip.*` - Chuyến đi
- `expense.*` - Chi tiêu
- `profile.*` - Hồ sơ
- `setting.*` - Cài đặt
- `validation.*` - Validation messages
- `errors.*` - Error messages

### Thêm Translation Mới

1. Thêm vào `src/i18n/vi.json`:

```json
{
  "myFeature": {
    "title": "Tiêu đề",
    "description": "Mô tả"
  }
}
```

2. Thêm vào `src/i18n/en.json`:

```json
{
  "myFeature": {
    "title": "Title",
    "description": "Description"
  }
}
```

3. Sử dụng:

```tsx
const { t } = useTranslation();
t('myFeature.title');
```

## Backend Setup

### Sử dụng I18nService

```typescript
import { I18nService } from 'src/i18n/i18n.service';

@Controller('example')
export class ExampleController {
  constructor(private readonly i18nService: I18nService) {}

  @Get()
  getExample(@Req() req: any) {
    const locale = req.headers['x-locale']; // 'vi' or 'en'

    const errorMsg = this.i18nService.getErrorMessage('user.not_found', locale);

    throw new NotFoundException(errorMsg);
  }
}
```

### Các Methods

```typescript
// Get translation
i18nService.translate('errors.user.not_found', locale);

// Get error message (bắt đầu với 'errors.')
i18nService.getErrorMessage('user.not_found', locale);

// Get success message (bắt đầu với 'messages.')
i18nService.getSuccessMessage('created', locale, { resource: 'Trip' });

// Với parameters
i18nService.translate('validation.field_required', locale, { field: 'Email' });
```

### Client Header

Frontend gửi locale qua header `x-locale`:

```typescript
headers: {
  'x-locale': 'vi' // or 'en'
}
```

## Thêm Translation Mới ở Backend

1. Thêm vào `src/i18n/vi.json`:

```json
{
  "errors": {
    "myError": {
      "my_key": "Thông báo lỗi"
    }
  }
}
```

2. Thêm vào `src/i18n/en.json`:

```json
{
  "errors": {
    "myError": {
      "my_key": "Error message"
    }
  }
}
```

3. Sử dụng:

```typescript
const msg = this.i18nService.getErrorMessage('myError.my_key', locale);
```

## Locale Switching (Frontend)

Locale được lưu vào localStorage với key `locale`:

```tsx
import { setItem } from '../../utils/storage';
import { KEY_STORAGE } from '../../constants/KeyStorage';

// Set locale
await setItem(KEY_STORAGE.locale, 'en');

// Reload app to apply changes
```

Trong SettingScreen đã có chức năng này rồi.

## Fallback Behavior

- Nếu key không tìm thấy ở locale hiện tại, hệ thống sẽ fallback sang tiếng Anh
- Nếu vẫn không tìm thấy, trả về key gốc

## Existing Translations

Các translations hiện tại:

- `common` (15 keys)
- `auth` (12 keys)
- `home` (6 keys)
- `trip` (15 keys)
- `expense` (14 keys)
- `profile` (13 keys)
- `setting` (20 keys)
- `validation` (6 keys)
- `errors` (18 keys)

**Tổng: ~119 keys**

Bạn có thể expand dictionary bằng cách thêm keys vào các file JSON.
