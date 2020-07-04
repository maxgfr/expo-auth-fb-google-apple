
import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Text,
  View
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Facebook from 'expo-facebook';
import * as Google from 'expo-google-app-auth';
import JSONTree from 'react-native-json-tree';
import { FontAwesome } from '@expo/vector-icons';

import {
  FACEBOOK_APP_ID,
  GOOGLE_ANDROID_ID,
  GOOGLE_IOS_ID
} from 'react-native-dotenv'

export default function App() {

  const [jsonObject, setJsonObject] = useState({});

  _onAuthGoogle = async () => {
    const { type, accessToken, user, idToken } = await Google.logInAsync({
      androidClientId: GOOGLE_ANDROID_ID,
      iosClientId: GOOGLE_IOS_ID,
      scopes: ['profile', 'email']
    });

    if (type === 'success') {
      const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json_rep = await response.json();
      setJsonObject(json_rep);
      alert(`Hi ${user.email}, your id is ${user.id}`);
    } else {
      alert(`Cancel`);
    }
  }

  _onAuthFacebook = async () => {
    try {
      await Facebook.initializeAsync(FACEBOOK_APP_ID);
      const {
        type,
        token,
        expires,
        permissions,
        declinedPermissions,
      } = await Facebook.logInWithReadPermissionsAsync({
        permissions: ['public_profile', 'email'],
      });
      if (type === 'success') {
        const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
        const json_rep = await response.json();
        setJsonObject(json_rep);
        alert(`Hi ${json_rep.email}, your id is ${json_rep.id}!`);
      } else {
        alert(`Cancel`);
      }
    } catch ({ message }) {
      alert(`Facebook Login Error: ${message}`);
    }
  }

  _onAuthApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      setJsonObject(credential);
      alert(`Hi ${credential.email}, your id is :${credential.user}`);
    } catch (e) {
      if (e.code === 'ERR_CANCELED') {
        alert(`Cancel`);
      } else {
        alert(`Apple Login Error: ${e.code}`);
      }
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="auto" />
      <TouchableOpacity onPress={_onAuthGoogle} style={[styles.button, { backgroundColor: "#4285F4" }]}>
        <FontAwesome name="google" size={17} color="#ffffff" />
        <Text style={styles.text}>Sign in with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={_onAuthFacebook} style={[styles.button, { backgroundColor: "#3b5998" }]}>
        <FontAwesome name="facebook" size={17} color="#ffffff" />
        <Text style={styles.text}>Sign in with Facebook</Text>
      </TouchableOpacity>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={5}
        style={{ width: 300, height: 50, marginBottom: 20 }}
        onPress={_onAuthApple}
      />
      <View style={styles.tree}>
      <JSONTree data={jsonObject} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontWeight: '600',
    fontSize: 19,
    color: '#ffffff',
    marginLeft: 5
  },
  button: {
    width: 300,
    height: 50,
    backgroundColor: "#4285F4",
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    marginBottom: 20,
    flexDirection: 'row'
  },
  tree: {
    paddingHorizontal: 100,
    marginBottom: 20
  }
});
