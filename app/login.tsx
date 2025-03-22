import React, { useState } from 'react';
import {
  StyleSheet,
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
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import { Text } from '@/components/Themed';
import { PrimaryButton } from '@/components/Buttons';

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
        signIn(response.data.token);
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
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <View style={styles.logoContainer}>
            <Image style={styles.logo} source={require('../assets/icon.png')} />
          </View>

          <Text type='title' style={styles.title}>
            Login
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder='Email'
              value={email}
              onChangeText={setEmail}
              autoCapitalize='none'
              autoCorrect={false}
              keyboardType='email-address'
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder='Password'
              secureTextEntry={!isVisible}
              value={password}
              onChangeText={setPassword}
              autoCapitalize='none'
              autoCorrect={false}
            />
            <TouchableOpacity onPress={toggleVisibility} style={styles.eyeIcon}>
              <Feather
                name={isVisible ? 'eye-off' : 'eye'}
                size={20}
                color='#666'
              />
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <RNText style={styles.errorText}>{error}</RNText>
            </View>
          )}

          <PrimaryButton
            title={isLoading ? '' : 'Login'}
            onPress={handleSubmit}
            disabled={isLoading}
            style={styles.loginButton}
          >
            {isLoading && <ActivityIndicator color='#fff' />}
          </PrimaryButton>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  passwordInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  loginButton: {
    marginTop: 10,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 4,
    marginBottom: 15,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
});
