import React, { useState, useEffect } from 'react';
import {
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { apiService, HttpError } from '@/utils/ApiService';
import { Text, View } from '@/components/Themed';
import { PrimaryButton } from '@/components/Buttons';
import globalStyles from '@/styles/globalStyles';
import { ErrorText, LabelText } from '@/components/Typography';
import {
  useThemeColor,
  getTextColor,
  getInputBackgroundColor,
  getBorderColor,
  getPlaceholderTextColor,
} from '@/hooks/useThemeColor';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const theme = useColorScheme() ?? 'light';
  const errorContainerBackgroundColor = useThemeColor(
    { light: Colors.light.errorBackground, dark: Colors.dark.errorBackground },
    'errorBackground'
  );
  const iconColor = useThemeColor({ light: '#666', dark: '#ccc' }, 'icon');
  const linkColor = useThemeColor({}, 'tint');
  const themedTextColor = getTextColor(theme);
  const themedInputBackgroundColor = getInputBackgroundColor(theme);
  const themedBorderColor = getBorderColor(theme);
  const themedPlaceholderTextColor = getPlaceholderTextColor(theme);

  const togglePasswordVisibility = () =>
    setIsPasswordVisible(!isPasswordVisible);
  const toggleConfirmPasswordVisibility = () =>
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and special characters (e.g., @, $, !, %, *, ?, &).'
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.post<{ user: any; message: string }>(
        '/users/signup',
        { firstName, lastName, email, password, phone }
      );

      if (response && response.user) {
        router.replace({ pathname: '/login', params: { email: email } });
      } else {
        setError(
          (response as any)?.message ||
            'Registration failed: Unexpected server response.'
        );
      }
    } catch (err) {
      if (err instanceof HttpError) {
        if (err.body?.message) {
          setError(err.body.message);
        } else if (err.status === 400) {
          setError(
            'Please ensure all fields are correctly filled and try again.'
          );
        } else {
          setError(
            'An unexpected error occurred during registration. Please try again.'
          );
        }
      } else {
        setError(
          'Unable to connect to the server. Please check your network connection and try again.'
        );
      }
      console.log('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[
        styles.container,
        { backgroundColor: useThemeColor({}, 'brand') },
      ]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View
            style={[
              styles.innerContainer,
              { backgroundColor: useThemeColor({}, 'brand') },
            ]}
          >
            <View
              style={[
                styles.logoContainer,
                { backgroundColor: useThemeColor({}, 'brand') },
              ]}
            >
              <Image
                style={styles.logo}
                source={require('../assets/icon.png')}
              />
            </View>

            <Text
              type='title'
              style={[
                globalStyles.title,
                styles.title,
                { color: themedTextColor },
              ]}
            >
              Create Account
            </Text>

            <View
              style={[
                styles.row,
                { backgroundColor: useThemeColor({}, 'brand') },
              ]}
            >
              <View
                style={[
                  globalStyles.inputContainer,
                  styles.inputRowItem,
                  styles.inputRowItemLeft,
                ]}
              >
                <LabelText>First Name</LabelText>
                <TextInput
                  style={[
                    globalStyles.themedFormInput,
                    {
                      backgroundColor: themedInputBackgroundColor,
                      color: themedTextColor,
                      borderColor: themedBorderColor,
                    },
                  ]}
                  placeholder='First name'
                  placeholderTextColor={themedPlaceholderTextColor}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize='words'
                />
              </View>

              <View
                style={[
                  globalStyles.inputContainer,
                  styles.inputRowItem,
                  styles.inputRowItemRight,
                ]}
              >
                <LabelText>Last Name</LabelText>
                <TextInput
                  style={[
                    globalStyles.themedFormInput,
                    {
                      backgroundColor: themedInputBackgroundColor,
                      color: themedTextColor,
                      borderColor: themedBorderColor,
                    },
                  ]}
                  placeholder='Last name'
                  placeholderTextColor={themedPlaceholderTextColor}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize='words'
                />
              </View>
            </View>

            <View style={globalStyles.inputContainer}>
              <LabelText>Email</LabelText>
              <TextInput
                style={[
                  globalStyles.themedFormInput,
                  {
                    backgroundColor: themedInputBackgroundColor,
                    color: themedTextColor,
                    borderColor: themedBorderColor,
                  },
                ]}
                placeholder='Enter your email address'
                placeholderTextColor={themedPlaceholderTextColor}
                value={email}
                onChangeText={setEmail}
                autoCapitalize='none'
                autoCorrect={false}
                keyboardType='email-address'
              />
            </View>

            <View style={globalStyles.inputContainer}>
              <LabelText>Phone Number</LabelText>
              <TextInput
                style={[
                  globalStyles.themedFormInput,
                  {
                    backgroundColor: themedInputBackgroundColor,
                    color: themedTextColor,
                    borderColor: themedBorderColor,
                  },
                ]}
                placeholder='Enter your phone number'
                placeholderTextColor={themedPlaceholderTextColor}
                value={phone}
                onChangeText={setPhone}
                keyboardType='phone-pad'
              />
            </View>

            <View style={globalStyles.inputContainer}>
              <LabelText>Password</LabelText>
              <View
                style={[
                  globalStyles.themedPasswordInputWrapper,
                  {
                    backgroundColor: themedInputBackgroundColor,
                    borderColor: themedBorderColor,
                  },
                ]}
              >
                <TextInput
                  style={[
                    globalStyles.themedPasswordTextInput,
                    { color: themedTextColor },
                  ]}
                  placeholder='Enter your password'
                  placeholderTextColor={themedPlaceholderTextColor}
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize='none'
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={togglePasswordVisibility}
                  style={globalStyles.eyeIcon}
                >
                  <MaterialIcons
                    name={isPasswordVisible ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={iconColor}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={globalStyles.inputContainer}>
              <LabelText>Confirm Password</LabelText>
              <View
                style={[
                  globalStyles.themedPasswordInputWrapper,
                  {
                    backgroundColor: themedInputBackgroundColor,
                    borderColor: themedBorderColor,
                  },
                ]}
              >
                <TextInput
                  style={[
                    globalStyles.themedPasswordTextInput,
                    { color: themedTextColor },
                  ]}
                  placeholder='Confirm your password'
                  placeholderTextColor={themedPlaceholderTextColor}
                  secureTextEntry={!isConfirmPasswordVisible}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize='none'
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={toggleConfirmPasswordVisibility}
                  style={globalStyles.eyeIcon}
                >
                  <MaterialIcons
                    name={
                      isConfirmPasswordVisible ? 'visibility-off' : 'visibility'
                    }
                    size={20}
                    color={iconColor}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {error && (
              <View
                style={[
                  styles.errorContainerLayout,
                  { backgroundColor: errorContainerBackgroundColor },
                ]}
              >
                <ErrorText>{error}</ErrorText>
              </View>
            )}

            <PrimaryButton
              title={isLoading ? '' : 'Register'}
              onPress={handleSubmit}
              disabled={isLoading}
              style={styles.registerButton}
            >
              {isLoading && (
                <ActivityIndicator
                  color={useThemeColor(
                    { light: Colors.dark.text, dark: Colors.light.text },
                    'text'
                  )}
                />
              )}
            </PrimaryButton>

            <TouchableOpacity
              onPress={() => router.replace('/login')}
              style={styles.signInLink}
            >
              <Text style={{ color: linkColor }}>
                Already have an account? Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 500,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 75,
    height: 75,
    resizeMode: 'contain',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  errorContainerLayout: {
    padding: 10,
    borderRadius: 4,
    marginBottom: 15,
  },
  registerButton: {
    marginTop: 10,
  },
  signInLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputRowItem: {
    flex: 1,
  },
  inputRowItemLeft: {
    marginRight: 8,
  },
  inputRowItemRight: {
    marginLeft: 8,
  },
});
