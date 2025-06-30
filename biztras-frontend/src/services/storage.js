const STORAGE_KEYS = {
  AUTH: 'biztras_auth',
  THEME: 'biztras_theme',
  USER_PREFERENCES: 'biztras_preferences',
};

export const getStoredAuth = () => {
  try {
    const auth = localStorage.getItem(STORAGE_KEYS.AUTH);
    return auth ? JSON.parse(auth) : null;
  } catch (error) {
    console.error('Error parsing stored auth:', error);
    return null;
  }
};

export const setStoredAuth = (authData) => {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(authData));
  } catch (error) {
    console.error('Error storing auth:', error);
  }
};

export const clearStoredAuth = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  } catch (error) {
    console.error('Error clearing auth:', error);
  }
};

export const getStoredTheme = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  } catch (error) {
    console.error('Error getting theme:', error);
    return 'light';
  }
};

export const setStoredTheme = (theme) => {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (error) {
    console.error('Error storing theme:', error);
  }
};