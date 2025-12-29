import React, { useState } from 'react';
import {
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

type Step = 'email' | 'otp' | 'password';

export default function LostPasswordScreen() {
  const router = useRouter();
  const auth = useAuth();
  const signIn = auth?.signIn;

  const [step, setStep] = useState<Step>('email');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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

  const handleRequestCode = async () => {
    Keyboard.dismiss();
    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiService.post('/users/otp/request', { email });
      setStep('otp');
    } catch (error) {
      if (error instanceof HttpError) {
        setError(error.body?.message || 'Error generating code, contact administrator');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    Keyboard.dismiss();
    if (!otpCode || otpCode.length < 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiService.post<{ tempPassword: string }>('/users/otp/verify', {
        email,
        otp: otpCode,
      });
      setTempPassword(data.tempPassword);
      setStep('password');
    } catch (error) {
      if (error instanceof HttpError) {
        setError(error.body?.message || 'Error validating code, contact administrator');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNewPassword = async () => {
    Keyboard.dismiss();
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Update Password
      await apiService.post('/users/otp/update', {
        tempPassword,
        password,
        email,
      });

      // 2. Auto Login
      const loginResponse = await apiService.post<{ token: string }>('/users/login', {
        email,
        password,
      });

      if (loginResponse?.token && signIn) {
        await signIn(loginResponse.token);
      } else {
        // Fallback if auto-login fails but reset worked
        router.replace('/login');
      }
    } catch (error) {
      if (error instanceof HttpError) {
        setError(error.body?.message || 'Failed to update password');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setError(null);
    if (step === 'password') {
      setStep('otp');
    } else if (step === 'otp') {
      setStep('email');
    } else {
      router.back();
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'email':
        return (
          <>
            <Text style={styles.description}>
              Enter your email address to receive a verification code.
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
                placeholder="Email"
                placeholderTextColor={themedPlaceholderTextColor}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>
            <PrimaryButton
              title={loading ? '' : 'Request Code'}
              onPress={handleRequestCode}
              disabled={loading}
              style={styles.button}
            >
              {loading && <ActivityIndicator color={activityIndicatorColor} />}
            </PrimaryButton>
          </>
        );
      case 'otp':
        return (
          <>
            <Text style={styles.description}>
              Enter the 6-digit code sent to {email}.
            </Text>
            <View style={globalStyles.inputContainer}>
              <LabelText style={{ color: 'white' }}>One Time Code</LabelText>
              <TextInput
                style={[
                  globalStyles.themedFormInput,
                  {
                    backgroundColor: themedInputBackgroundColor,
                    color: themedTextColor,
                    borderColor: themedBorderColor,
                    textAlign: 'center',
                    letterSpacing: 8,
                    fontSize: 24,
                  },
                ]}
                placeholder="000000"
                placeholderTextColor={themedPlaceholderTextColor}
                value={otpCode}
                onChangeText={setOtpCode}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
            </View>
            <PrimaryButton
              title={loading ? '' : 'Verify Code'}
              onPress={handleVerifyCode}
              disabled={loading}
              style={styles.button}
            >
              {loading && <ActivityIndicator color={activityIndicatorColor} />}
            </PrimaryButton>
          </>
        );
      case 'password':
        return (
          <>
            <Text style={styles.description}>Enter your new password.</Text>
            <View style={globalStyles.inputContainer}>
              <LabelText style={{ color: 'white' }}>New Password</LabelText>
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
                  placeholder="Password"
                  placeholderTextColor={themedPlaceholderTextColor}
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={globalStyles.eyeIcon}
                >
                  <MaterialIcons
                    name={isPasswordVisible ? 'visibility-off' : 'visibility'}
                    size={24}
                    color={iconColor}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <PrimaryButton
              title={loading ? '' : 'Submit'}
              onPress={handleSubmitNewPassword}
              disabled={loading}
              style={styles.button}
            >
              {loading && <ActivityIndicator color={activityIndicatorColor} />}
            </PrimaryButton>
          </>
        );
    }
  };

  const getTitle = () => {
    switch (step) {
      case 'email':
        return 'Reset Password';
      case 'otp':
        return 'Enter Code';
      case 'password':
        return 'New Password';
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
            <Text
              type="title"
              style={[globalStyles.title, styles.title, { color: 'white' }]}
            >
              {getTitle()}
            </Text>

            {renderStepContent()}

            {error && (
              <View
                style={[
                  styles.errorContainer,
                  { backgroundColor: errorContainerBackgroundColor },
                ]}
              >
                <ErrorText>{error}</ErrorText>
              </View>
            )}

            <TouchableOpacity onPress={handleBack} style={styles.backLink}>
              <Text style={{ color: linkColor }}>
                {step === 'email' ? 'Back to Login' : 'Back'}
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
    width: '100%',
    maxWidth: 500,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    color: 'white',
    opacity: 0.9,
  },
  button: {
    marginTop: 10,
  },
  errorContainer: {
    padding: 10,
    borderRadius: 4,
    marginTop: 15,
  },
  backLink: {
    marginTop: 20,
    alignItems: 'center',
  },
});
