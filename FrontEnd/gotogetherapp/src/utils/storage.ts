import AsyncStorage from '@react-native-async-storage/async-storage';

export const setItem = async (key: string, value: unknown) => {
  try {
    if (value === null || value === undefined) {
      // Removing a key is safer than storing null/undefined
      await AsyncStorage.removeItem(key);
      return;
    }

    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Error setting item to AsyncStorage', e);
  }
};
export const getItem = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value);
    }
  } catch (e) {
    console.error('Error getting item from AsyncStorage', e);
  }
};
export const removeItem = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error('AsyncStorage removeItem error:', e);
  }
};

export const clearAsync = async () => {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    console.error('AsyncStorage clear error:', e);
  }
};
