
import React, { useState } from 'react';
import {
  StyleSheet,
  Button,
  View
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Facebook from 'expo-facebook';
import * as Google from 'expo-google-app-auth';
import JSONTree from 'react-native-json-tree';
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
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Button onPress={_onAuthGoogle} title="Authentification with Google"/>
      <Button onPress={_onAuthFacebook} title="Authentification with Facebook"/>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={5}
        style={{ width: 200, height: 44 }}
        onPress={_onAuthApple}
      />
      <JSONTree data={jsonObject} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
