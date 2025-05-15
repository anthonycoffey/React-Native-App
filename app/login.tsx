import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  ActivityIndicator,
  Text as RNText,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, HttpError } from '@/utils/ApiService'; // Import new apiService and HttpError
import { Text } from '@/components/Themed';
import { PrimaryButton } from '@/components/Buttons';
import globalStyles from '@/styles/globalStyles';
import { ImageStyle, ViewStyle, TextStyle } from 'react-native'; // Import Style types

export default function LoginScreen() {
  const auth = useAuth(); // Get the whole auth object
  const signIn = auth?.signIn; // Safely access signIn
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // No need for effect to check session and redirect - signIn handles this

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handleSubmit = async () => {
    // Simple validation
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
      // Assuming the API returns { token: string } on successful login
      const response = await apiService.post<{ token: string }>(`/users/login`, {
        email,
        password,
      });
      
      if (response?.token && signIn) { // Check if signIn is available
        await signIn(response.token);
      } else if (!signIn) {
        console.error('Login error: signIn function is not available from AuthContext.');
        setError('Login service is currently unavailable. Please try again later.');
      } else {
        // This case should ideally be caught by HttpError if server response is not as expected
        // but apiService.post would throw if response.ok is false or JSON parsing fails.
        // If response.ok is true but token is missing, it's an unexpected success response.
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
          // Use message from error body if available
          const message = error.body?.message || 'Login failed. Please check your credentials and try again.';
          setError(message);
        }
      } else {
        // For network errors or other non-HttpError issues
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
            <View style={globalStyles.errorContainer}>
              <RNText style={globalStyles.errorText}>{error}</RNText>
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

// Keep only unique login-specific styles
const loginStyles = {
  container: {
    flex: 1,
    backgroundColor: '#252d3a',
  } as ViewStyle,
  innerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  } as ViewStyle,
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  } as ViewStyle,
  logo: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
  } as ImageStyle,
  title: {
    color: '#fff',
    // Note: This style is merged with globalStyles.title, 
    // so its final type compatibility depends on that merge.
    // However, 'color' is a valid TextStyle property.
  } as TextStyle, 
  loginButton: {
    marginTop: 10,
  } as ViewStyle,
};
