import * as React from 'react';
import * as Library from '../../abstract-library';
import * as Data from '../../abstract-data';

export default class SetupProfile extends React.Component {

    state = {
        imagePath: require('../../assets/images/1-demo-user.png'),
        isLoading: false,
        fname: "",
        lname: "",
        imgname: "",
        imgurl: "",
        location: "Select Location",
        cancelkeyboard: Library.Native.Keyboard.dismiss
    }

    onPickLocation(value, index) {
        if (index != 0) {
            this.setState({ location: value });
        } else {
            this.setState({ location: "Select Location" });
        }
    }

    async chooseFile() {
        try {
            this.setState({ status: '' });
            const options = {
                mediaType: 'photo',
                maxHeight: 200,
                maxWidth: 200,
                quality: 1
            };
            Library.PickImage(options, await this.onResponse.bind(this));
        } catch (error) { console.log("Error: ", error); };
    };

    async onResponse(response) {
        if (response.didCancel) {
            console.log('Cancelled');
        } else if (response.errorCode) {
            console.log('Error: ', response.errorCode);
        } else {
            let path = response.uri;
            console.log("response: ", response);
            let fileName = this.getFileName(response.fileName, path);
            this.setState({ imgname: fileName });
            this.setState({ imagePath: path });
            await this.uploadImageToStorage(path, fileName);
        }
    }

    getFileName(name, path) {
        if (name != null) { return name; }
        return path.split("/").pop();
    }

    async uploadImageToStorage(path, name) {
        this.setState({ isLoading: true });
        const id = Library.authentication().currentUser.uid;
        const ref = Library.FirebaseStorage().ref(`users/${id}/profileimage/${id}`);
        const task = await ref.putFile(path);

        switch (task.state) {
            case "cancelled":
                console.log("Cancelled");
                break;
            case "paused":
                console.log("Paused");
                break;
            case "error":
                console.log("Error");
                this.setState({ isLoading: false });
                break;
            case "running":
                console.log("bytes: ", task.bytesTransferred);
                break;
            default:
                console.log('Uploaded');
                this.setState({ isLoading: false });
                const url = await ref.getDownloadURL();
                console.log("url: ", url);
                this.setState({ imgurl: url });
        }
    }

    getPlatformURI(imagePath) {
        let imgSource = imagePath;
        if (isNaN(imagePath)) {
            imgSource = { uri: this.state.imagePath };
            imgSource.uri = imgSource.uri;
        }
        return imgSource;
    }

    showDialogAndroidLocationInfo() {
        Library.DialogAndroid.alert("",
            `<b>Why is your location not here?</b>
             So far, only a few locations are available here in vacuum application`,
            {
                contentIsHtml: true
            }
        );
    }

    doneFirstName(value) {
        this.state.fname = value;
        this.setState({ fname: this.state.fname });
    }

    doneLastName(value) {
        this.state.lname = value;
        this.setState({ lname: this.state.lname });
    }

    onSubmit() {
        this.state.cancelkeyboard = Library.Native.Keyboard.dismiss();
        this.setState({ cancelkeyboard: this.state.cancelkeyboard });
        const id = Library.authentication().currentUser.uid;
        const userCOL = Library.firestore().collection("users");
        const userDOC = userCOL.doc(id);
        const data = {
            author: {
                first: this.state.fname,
                last: this.state.lname,
                full: `${this.state.fname} ${this.state.lname}`
            },
            location: this.state.location,
            image: this.state.imgurl
        }
        const condition = userDOC.set(data);
        condition.then(this.onSubmitSuccess.bind(this));
        condition.catch(this.onSubmitFailed.bind(this));

    }

    onSubmitSuccess() {
        return Library.Nav.push(this.props.componentId, {
            component: {
                name: "SelectTask",
                passProps: {
                    props: this.props
                }
            }
        })
    }

    onSubmitFailed(err) {
        this.state.cancelkeyboard = Library.Native.Keyboard.dismiss();
        this.setState({ cancelkeyboard: this.state.cancelkeyboard });
        console.log(err);
    }

    render() {
        let { imagePath } = this.state;
        let imgSource = this.getPlatformURI(imagePath);
        return (
            <Library.Base.Container style={{ backgroundColor: "#05dee2" }}>
                <Library.Base.Header
                    androidStatusBarColor="#05dee2"
                    noLeft
                    transparent>
                    <Library.Base.Left style={{ flex: 1, margin: 10 }}>
                    </Library.Base.Left>
                    <Library.Base.Body style={{ flex: 1 }}>
                        <Library.Base.Button transparent block>
                            <Library.Base.Title>Setup</Library.Base.Title>
                        </Library.Base.Button>
                    </Library.Base.Body>
                    <Library.Base.Right style={{ flex: 1, margin: 10 }}>

                    </Library.Base.Right>
                </Library.Base.Header>
                <Library.Base.Content padder>
                    <Library.Base.Card transparent style={{ borderRadius: 10, padding: 10, backgroundColor: "#e5f8f5" }}>
                        <Library.Base.CardItem style={{ borderRadius: 10, padding: 10, flexDirection: "column" }}>
                            <Library.Box.Grid>
                                <Library.Box.Col style={{ backgroundColor: "#e4f7fd", padding: 10, borderTopRightRadius: 10, borderTopLeftRadius: 10 }}>
                                    <Library.Box.Row></Library.Box.Row>
                                    <Library.Box.Row>
                                        <Library.Box.Col></Library.Box.Col>
                                        <Library.Native.Image
                                            style={{
                                                width: 200,
                                                height: 200,
                                                borderRadius: 100,
                                                borderColor: this.state.isLoading ? "#fcc4c3" : "#e5f8f5",
                                                borderWidth: 4
                                            }}
                                            blurRadius={this.state.isLoading ? 5 : 0}
                                            source={imgSource}
                                        />
                                        <Library.Box.Col style={{ flexDirection: "column-reverse" }}>
                                            <Library.Base.Button
                                                transparent
                                                style={{
                                                    marginLeft: -80,
                                                    borderRadius: 100,
                                                    elevation: 0
                                                }}
                                                onPress={this.chooseFile.bind(this)}>
                                                <Library.Base.Icon type="AntDesign" style={{ fontSize: 50, color: "#05dee2", backgroundColor: "#ffffff", borderRadius: 100 }} name="pluscircle" />
                                            </Library.Base.Button>
                                        </Library.Box.Col>
                                    </Library.Box.Row>
                                    <Library.Box.Row></Library.Box.Row>
                                </Library.Box.Col>
                            </Library.Box.Grid>
                            <Library.Base.Body style={{ padding: 10, backgroundColor: "#e4f7fd", borderBottomRightRadius: 10, borderBottomLeftRadius: 10 }}>
                                <Library.Base.Item inlineLabel style={{ backgroundColor: "#e5f8f5", borderBottomColor: "#05dee2", borderBottomWidth: 3 }}>
                                    <Library.Base.Label>First Name</Library.Base.Label>
                                    <Library.Base.Input
                                        onSubmitEditing={this.state.cancelkeyboard}
                                        onChangeText={this.doneFirstName.bind(this)} maxLength={20} />
                                </Library.Base.Item>
                                <Library.Base.Item inlineLabel last style={{ backgroundColor: "#e5f8f5", borderBottomColor: "#fcc4c3", borderBottomWidth: 3 }}>
                                    <Library.Base.Label>Last Name</Library.Base.Label>
                                    <Library.Base.Input
                                        onSubmitEditing={this.state.cancelkeyboard}
                                        onChangeText={this.doneLastName.bind(this)} maxLength={20} />
                                </Library.Base.Item>
                                <Library.Box.Grid>
                                    <Library.Box.Col>
                                        <Library.Base.Item picker style={{ backgroundColor: "#e5f8f5", borderBottomColor: "#05dee2", borderBottomWidth: 3 }}>
                                            <Library.Base.Icon name='md-location-outline' />
                                            <Library.Base.Picker
                                                mode="dialog"
                                                style={{ width: undefined }}
                                                selectedValue={this.state.location}
                                                onValueChange={(v, i) => { this.onPickLocation(v, i) }}>
                                                {
                                                    Data.Data.location.map((v) => (
                                                        <Library.Base.Picker.Item key={v} label={v} value={v} />
                                                    ))
                                                }

                                            </Library.Base.Picker>
                                            <Library.Base.Icon onPress={this.showDialogAndroidLocationInfo} name='information-circle' />
                                        </Library.Base.Item>
                                    </Library.Box.Col>
                                </Library.Box.Grid>
                                <Library.Base.Text>
                                    {'\n'}
                                </Library.Base.Text>
                                <Library.Base.Button
                                    rounded
                                    block
                                    onPress={this.onSubmit.bind(this)}
                                    style={{ backgroundColor: "#05dee2", elevation: 0 }}>
                                    <Library.Base.H3 style={{ color: "#FFFFFF" }}>Ready!</Library.Base.H3>
                                </Library.Base.Button>
                            </Library.Base.Body>
                        </Library.Base.CardItem>
                    </Library.Base.Card>
                </Library.Base.Content>
            </Library.Base.Container>
        );
    }

    componentDidMount() {
        Library.Native.BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
        Library.SplashScreen.hide();
    }

    componentWillUnmount() {
        Library.Native.BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
    }

    onBackPress = () => {
        return true;
    }
}