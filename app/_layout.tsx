import React, { useEffect } from 'react';
import { ThemeProvider, createTheme } from '@rneui/themed';
import { Slot, Stack, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Header, Icon } from '@rneui/themed';
import { TouchableOpacity } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Token = string | null;

export default function Layout() {
  const [token, setToken] = React.useState<Token | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const value = await AsyncStorage.getItem('token');
        setToken(value);
      } catch (e) {
        // error reading value
      }
    };
    getData();
  });

  const Menu = () => {
    return (
      <TouchableOpacity onPress={() => {}}>
        <View className=''>
          <Icon
            name='menu'
            color='#fff'
          />
        </View>
      </TouchableOpacity>
    );
  };

  const Logout = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          AsyncStorage.removeItem('token');
          setToken(null);
          router.replace('/');
        }}
      >
        <View className=''>
          <Icon
            name='logout'
            color='#fff'
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Header
        leftComponent={<Menu />}
        centerComponent={
          !token ? { text: 'Login', style: styles.heading } : null
        }
        rightComponent={<Logout />}
      />

      <Slot />
    </ThemeProvider>
  );
}

const theme = createTheme({
  lightColors: {
    primary: '#050512',
  },
  darkColors: {
    primary: '#3d5afe',
  },
  mode: 'light',
  components: {
    Text: {
      h1Style: {
        fontSize: 80,
      },
    },
  },
});

const styles = StyleSheet.create({
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#397af8',
    marginBottom: 20,
    width: '100%',
    paddingVertical: 15,
  },
  heading: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 5,
  },
  subheaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
