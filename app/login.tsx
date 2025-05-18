import React, { useState } from 'react';
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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, HttpError } from '@/utils/ApiService';
import { Text, View } from '@/components/Themed';
import { PrimaryButton } from '@/components/Buttons';
import globalStyles from '@/styles/globalStyles';
import { ErrorText } from '@/components/Typography';
import { useThemeColor } from '@/hooks/useThemeColor';
import Colors from '@/constants/Colors';

export default function LoginScreen() {
  const auth = useAuth();
  const signIn = auth?.signIn;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const errorContainerBackgroundColor = useThemeColor(
    { light: Colors.light.errorBackground, dark: Colors.dark.errorBackground },
    'errorBackground'
  );

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handleSubmit = async () => {
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
      const response = await apiService.post<{ token: string }>(`/users/login`, {
        email,
        password,
      });
      
      if (response?.token && signIn) {
        await signIn(response.token);
      } else if (!signIn) {
        console.error('Login error: signIn function is not available from AuthContext.');
        setError('Login service is currently unavailable. Please try again later.');
      } else {
        console.error('Login error: Invalid response format - token missing.', response);
        setError('Login failed due to an unexpected server response.');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof HttpError) {
        if (error.status === 401 || error.status === 403) {
          setError('Invalid email or password. Please try again.');
        } else if (error.status >= 500) {
          setError('Server error. Please try again later.');
        } else {
          const message = error.body?.message || 'Login failed. Please check your credentials and try again.';
          setError(message);
        }
      } else {
        setError('Unable to connect or an unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={loginStyles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={loginStyles.innerContainer}>
          <View style={loginStyles.logoContainer}>
            <Image style={loginStyles.logo} source={require('../assets/icon.png')} />
          </View>

          <Text type='title' style={[globalStyles.title, loginStyles.title]}>
            Login
          </Text>

          <View style={globalStyles.inputContainer}>
            <TextInput
              style={globalStyles.formInput}
              placeholder='Email'
              value={email}
              onChangeText={setEmail}
              autoCapitalize='none'
              autoCorrect={false}
              keyboardType='email-address'
            />
          </View>

          <View style={globalStyles.inputContainer}>
            <TextInput
              style={globalStyles.passwordInput}
              placeholder='Password'
              secureTextEntry={!isVisible}
              value={password}
              onChangeText={setPassword}
              autoCapitalize='none'
              autoCorrect={false}
            />
            <TouchableOpacity onPress={toggleVisibility} style={globalStyles.eyeIcon}>
              <MaterialIcons
                name={isVisible ? 'visibility-off' : 'visibility'}
                size={20}
                color='#666'
              />
            </TouchableOpacity>
          </View>

          {error && (
            <View style={[loginStyles.errorContainerLayout, { backgroundColor: errorContainerBackgroundColor }]}>
              <ErrorText>{error}</ErrorText>
            </View>
          )}

          <PrimaryButton
            title={isLoading ? '' : 'Login'}
            onPress={handleSubmit}
            disabled={isLoading}
            style={loginStyles.loginButton}
          >
            {isLoading && <ActivityIndicator color='#fff' />}
          </PrimaryButton>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#252d3a',
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
  },
  title: {
    color: '#fff',
  },
  errorContainerLayout: {
    padding: 10,
    borderRadius: 4,
    marginBottom: 15,
  },
  loginButton: {
    marginTop: 10,
  },
});
