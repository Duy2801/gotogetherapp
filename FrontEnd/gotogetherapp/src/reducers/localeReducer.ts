import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { setItem } from '../utils/storage';
import { KEY_STORAGE } from '../constants/KeyStorage';

export type LocaleState = 'vi' | 'en';

const initialState: LocaleState = 'vi';

const localeSlice = createSlice({
  name: 'locale',
  initialState,
  reducers: {
    setLocale: (_, action: PayloadAction<LocaleState>) => {
      setItem(KEY_STORAGE.locale, action.payload);
      return action.payload;
    },
  },
});

export const { setLocale } = localeSlice.actions;
export default localeSlice.reducer;
