const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const buttonVariants = {
  error: '#e53935',
  warning: '#fbc02d',
  success: '#43a047',
  primary: '#0a7ea4',
  secondary: '#65b9d6',
};

export const ui = {
  disabled: {
    background: '#d3d3d3',
    text: '#a9a9a9',
  }
};

export default {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    borderColor: '#ddd',
    errorText: '#D32F2F',
    errorBackground: '#FFEBEE',
    shadow: '#000000',
    brand: '#252d3a',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    borderColor: '#444',
    errorText: '#FFCDD2',
    errorBackground: '#B71C1C',
    shadow: '#333333',
    brand: '#252d3a',
  },
};
