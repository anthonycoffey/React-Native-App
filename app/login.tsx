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
import api from '@/utils/api';
import { Text } from '@/components/Themed';
import { PrimaryButton } from '@/components/Buttons';
import globalStyles from '@/styles/globalStyles';

export default function LoginScreen() {
  const { signIn } = useAuth();
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
          
      // Otherwise try the real API
      const response = await api.post(`/users/login`, {
        email,
        password,
      });
      
      if (response.data?.token) {
        await signIn(response.data.token);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle different error types
      if (error.response) {
        // Server returned an error response
        if (error.response.status === 401 || error.response.status === 403) {
          setError('Invalid email or password. Please try again.');
        } else if (error.response.status >= 500) {
          setError('Server error. Please try again later.');
        } else {
          setError('Login failed. Please check your credentials and try again.');
        }
      } else if (error.request) {
        // Request was made but no response received
        setError('Unable to connect to the server. Please check your internet connection.');
      } else {
        // Error setting up the request
        setError('Something went wrong. Please try again later.');
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
  loginButton: {
    marginTop: 10,
  },
};
