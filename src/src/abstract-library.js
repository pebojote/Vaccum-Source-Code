// Library Import
import * as Native from 'react-native';
import * as Base from 'native-base';
import DialogAndroid from 'react-native-dialogs';
import { Navigation } from 'react-native-navigation';
import SplashScreen from 'react-native-splash-screen';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import * as Box from 'react-native-easy-grid';
import firebase from '@react-native-firebase/app';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';

// Library Export
export { Base, Native, DialogAndroid, Navigation as Nav, SplashScreen };
export { launchImageLibrary as PickImage, AsyncStorage as Storage, LottieView as Animated };
export { Box, storage as FirebaseStorage, Calendar, auth as authentication };
export { firebase, firestore, moment };