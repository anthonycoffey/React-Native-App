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
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, HttpError } from '@/utils/ApiService';
import { Text, View } from '@/components/Themed';
import { PrimaryButton } from '@/components/Buttons';
import globalStyles from '@/styles/globalStyles';
import { ErrorText, LabelText } from '@/components/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import {
  useThemeColor,
  getTextColor,
  getInputBackgroundColor,
  getPlaceholderTextColor,
  getBorderColor,
} from '@/hooks/useThemeColor';
import Colors from '@/constants/Colors';

export default function LoginScreen() {
  const auth = useAuth();
  const signIn = auth?.signIn;
  const { email: registeredEmail } = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(registeredEmail || '');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
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

  const activityIndicatorColor =
    theme === 'light' ? Colors.dark.text : Colors.light.text;

  useEffect(() => {
    if (registeredEmail) {
      setEmail(registeredEmail);
    }
  }, [registeredEmail]);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.post<{ token: string }>(
        `/users/login`,
        {
          email,
          password,
        }
      );

      if (response?.token && signIn) {
        await signIn(response.token);
      } else if (!signIn) {
        console.log(
          'Login error: signIn function is not available from AuthContext.'
        );
        setError(
          'Login service is currently unavailable. Please try again later.'
        );
      } else {
        console.log(
          'Login error: Invalid response format - token missing.',
          response
        );
        setError('Login failed due to an unexpected server response.');
      }
    } catch (error) {
      console.log('Login error:', error);
      if (error instanceof HttpError) {
        if (error.status === 401 || error.status === 403) {
          setError('Invalid email or password. Please try again.');
        } else if (error.status >= 500) {
          setError('Server error. Please try again later.');
        } else {
          const message =
            error.body?.message ||
            'Login failed. Please check your credentials and try again.';
          setError(message);
        }
      } else {
        setError(
          'Unable to connect or an unexpected error occurred. Please try again later.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[
        loginStyles.container,
        { backgroundColor: useThemeColor({}, 'brand') },
      ]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={loginStyles.scrollViewContent}>
          <View
            style={[
              loginStyles.innerContainer,
              { backgroundColor: useThemeColor({}, 'brand') },
            ]}
          >
            <View
              style={[
                loginStyles.logoContainer,
                { backgroundColor: useThemeColor({}, 'brand') },
              ]}
            >
              <Image
                style={loginStyles.logo}
                source={require('../assets/icon.png')}
              />
            </View>

            <Text
              type='title'
              style={[
                globalStyles.title,
                loginStyles.title,
                { color: 'white' },
              ]}
            >
              Sign In
            </Text>

            <View style={globalStyles.inputContainer}>
              <LabelText style={{ color: 'white' }}>Email</LabelText>
              <TextInput
                style={[
                  globalStyles.themedFormInput,
                  {
                    backgroundColor: themedInputBackgroundColor,
                    color: themedTextColor,
                    borderColor: themedBorderColor,
                  },
                ]}
                placeholder='Email'
                placeholderTextColor={themedPlaceholderTextColor}
                value={email}
                onChangeText={setEmail}
                autoCapitalize='none'
                autoCorrect={false}
                keyboardType='email-address'
              />
            </View>

            <View style={globalStyles.inputContainer}>
              <LabelText style={{ color: 'white' }}>Password</LabelText>
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
                  placeholder='Password'
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

            {error && (
              <View
                style={[
                  loginStyles.errorContainerLayout,
                  { backgroundColor: errorContainerBackgroundColor },
                ]}
              >
                <ErrorText>{error}</ErrorText>
              </View>
            )}

            <PrimaryButton
              title={isLoading ? '' : 'Login'}
              onPress={handleSubmit}
              disabled={isLoading}
              style={loginStyles.loginButton}
            >
              {isLoading && (
                <ActivityIndicator color={activityIndicatorColor} />
              )}
            </PrimaryButton>

            <TouchableOpacity
              onPress={() => router.push('/register')}
              style={loginStyles.signUpLink}
            >
              <Text style={{ color: linkColor }}>
                Don't have an account? Sign Up
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/lost-password')}
              style={loginStyles.forgotPasswordLink}
            >
              <Text style={{ color: linkColor }}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const loginStyles = StyleSheet.create({
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
    width: '100%',
    maxWidth: 500,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 150,
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
  loginButton: {
    marginTop: 10,
  },
  signUpLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  forgotPasswordLink: {
    marginTop: 15,
    alignItems: 'center',
  },
});
