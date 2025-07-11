import { useEffect } from 'react';
import { BackHandler } from 'react-native';

/**
 * Custom hook to handle the Android hardware back press event.
 * @param onBackPress The function to execute when the back button is pressed.
 *                    It should return true to prevent default behavior, or false to allow it.
 */
const useAndroidBackHandler = (onBackPress: () => boolean) => {
  useEffect(() => {
    const backAction = () => {
      return onBackPress();
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [onBackPress]);
};

export default useAndroidBackHandler;
