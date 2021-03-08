import * as React from 'react';
import * as Library from '../../abstract-library';

export default class FirebaseMethod extends React.Component {

    constructor(props) {
        super(props);
        this.onSignUp = this.onSignUp.bind(this);
    }

    state = {
        imageURL: ""
    }

    // Overview Method: Start Up
    async userHaveDB(uid) {
        try {
            const id = uid;
            const db = Library.firestore();
            const userCOL = db.collection("users");
            const is = await userCOL.get();
            if (is.empty) {
                return false;
            } else {
                const isExist = await userCOL.doc(id).get();
                if (isExist.exists) {
                    return true;
                } else {
                    return false;
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    // Sign Up Method: Sign Up Button
    async onSignUp(email, password, props) {
        const auth = Library.authentication();
        try {
            const createUser = await auth.createUserWithEmailAndPassword(email, password);
            const isNew = createUser.additionalUserInfo.isNewUser;
            if (isNew) {
                await Library.Storage.setItem("Active", "true");
                return Library.Nav.push(props.componentId, {
                    component: {
                        name: "SetupProfile",
                        passProps: {
                            props: props
                        }
                    }
                });
            }
        } catch (err) {

            switch (err.code) {
                case 'auth/email-already-in-use':
                    console.log('That email address is already in use!');
                    break;
                case 'auth/invalid-email':
                    console.log('That email address is invalid!');
                    break;
                default:
                    console.error(err);
            }


        }
    }

    onSetup() {
        // Get a reference to the storage service, which is used to create references in your storage bucket
        var storage = firebase.storage();

        // Create a storage reference from our storage service
        var storageRef = storage.ref();

        // Create a reference to the file we want to download
        var starsRef = storageRef.child('images/stars.jpg');

        // Get the download URL
        starsRef.getDownloadURL().then(function (url) {
            this.state.imageURL = url;
        }).catch(function (error) {

            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            switch (error.code) {
                case 'storage/object-not-found':
                    // File doesn't exist
                    break;

                case 'storage/unauthorized':
                    // User doesn't have permission to access the object
                    break;

                case 'storage/canceled':
                    // User canceled the upload
                    break;
                case 'storage/unknown':
                    // Unknown error occurred, inspect the server response
                    break;
            }
        });
    }
}