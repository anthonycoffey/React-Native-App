import React from 'react';
import { ThemeProvider, createTheme } from '@rneui/themed';
import { Slot, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Header, Icon } from '@rneui/themed';
import { TouchableOpacity } from 'react-native-gesture-handler';
export default function HomeLayout() {
  return (
    <ThemeProvider theme={theme}>
      <Header
        leftComponent={
          {
            // icon: 'menu',
            // color: '#fff',
          }
        }
        rightComponent={
          <View style={styles.headerRight}>
            {/* <TouchableOpacity
              style={{ marginLeft: 10 }}
              onPress={() => {}}
            >
              <Icon
                type='antdesign'
                name='find'
                color='white'
              />
            </TouchableOpacity> */}
          </View>
        }
        centerComponent={{ text: 'Login', style: styles.heading }}
      />
      <Slot />
    </ThemeProvider>
  );
}

const theme = createTheme({
  lightColors: {
    primary: '#3d5afe',
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
