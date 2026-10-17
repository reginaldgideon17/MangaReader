// The phone's small notebook (AsyncStorage). Two helpers so the rest
// of the app never has to think about JSON.stringify / JSON.parse.
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function loadValue(key, fallback) {
  try {
    const saved = await AsyncStorage.getItem(key);
    if (saved === null) return fallback;
    try {
      return JSON.parse(saved);
    } catch (e) {
      return saved; // older plain-text values, like the language code
    }
  } catch (e) {
    return fallback;
  }
}

export async function saveValue(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
}
