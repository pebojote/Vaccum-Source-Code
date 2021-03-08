import * as React from 'react';
import * as Library from '../../abstract-library';
import * as Helper from '../../abstract-helper';
import * as Data from '../../abstract-data';
import * as Template from '../../abstract-template';

var BUTTONS = [
    { text: "Delete Account", icon: "deleteuser", iconColor: "#f42ced", iconType: "AntDesign" },
    { text: "Logout Account", icon: "logout", iconColor: "#2c8ef4", iconType: "MaterialIcons" }
];
var DESTRUCTIVE_INDEX = 3;
var CANCEL_INDEX = 4;

export default class Home extends React.Component {

    constructor(props) {
        super(props);

        this.storage = new Helper.StorageMethod();
    }

    state = {
        made: [],
        cleaned: [],
        cleanedID: []
    }

    deleteMade(id) {
        const newArray = this.state.made.filter(v => v.id != id);
        this.state.made = newArray;
        this.setState({ made: this.state.made }, this.onDelete(id));
    }

    onDelete(key) {
        const id = Library.authentication().currentUser.uid;
        const userCOL = Library.firestore().collection("users");
        const madeCOL = userCOL.doc(id).collection("made");
        madeCOL.doc(key).delete();
    }

    onSetting() {
        Library.Base.ActionSheet.show(
            {
                options: BUTTONS,
                cancelButtonIndex: CANCEL_INDEX,
                destructiveButtonIndex: DESTRUCTIVE_INDEX,
                title: "Setting"
            },
            async (buttonIndex) => {
                try {
                    await this.onSettingSelected(BUTTONS[buttonIndex]);
                } catch (error) { console.log("Error: ", error); }
            }
        )

    }

    async onSettingSelected(option) {
        try {
            switch (option.text) {
                case "Delete Account":
                    await this.deleteAccount();
                    break;
                case "Logout Account":
                    await this.logoutAccount();
                    break;
                default:
                    break;
            }
        } catch (error) { console.log("Error: ", error); }
    }

    async deleteAccount() {
        try {
            const { action } = await Library.DialogAndroid.alert("Delete Account", "Are you sure you want to delete your accout?", {
                positiveText: "Yes",
                negativeText: "No"
            });
            switch (action) {
                case Library.DialogAndroid.actionPositive:
                    console.log('positive!');
                    await this.deleteUserData();
                    break;
                case Library.DialogAndroid.actionNegative:
                    console.log('negative!');
                    break;
                case Library.DialogAndroid.actionNeutral:
                    console.log('neutral!');
                    break;
                case Library.DialogAndroid.actionDismiss:
                    console.log('dismissed!');
                    break;
            }
        } catch (error) { console.log("Error: ", error); }
    }

    async deleteUserData() {
        try {
            // Firestore
            const auth = Library.authentication();
            const UID = auth.currentUser.uid;
            const fire = Library.firestore();
            const user = fire.collection("users").doc(UID);
            const collectionMade = user.collection("made");
            const is = await collectionMade.get();
            if (!is.empty) {
                const madeDocs = is.docs;
                for (let i = 0, l = madeDocs.length; i < l; i++) {
                    const documentMadeID = madeDocs[i].id;
                    const collectionMadeDeleted = collectionMade.doc(documentMadeID).delete();
                    collectionMadeDeleted.then(this.removeActiveKey);
                    collectionMadeDeleted.catch(error => { console.log("Error: ", error); });
                }
            }
        } catch (error) { console.log("Error: ", error); }
    }

    async removeActiveKey() {
        try {
            const auth = Library.authentication();
            const UID = auth.currentUser.uid;
            const fire = Library.firestore();
            const user = fire.collection("users").doc(UID);
            console.log("Made document deleted");
            await Library.Storage.removeItem("Active");
            console.log("Active key deleted");
            user.delete
            const userDocument = user.delete();
            userDocument.then(async () => {
                try {
                    console.log("User data deleted");
                    const auth = Library.authentication;
                    const currentUser = auth().currentUser;
                    const { action, text } = await Library.DialogAndroid.prompt("Password", "Provide your current password");
                    if (action === Library.DialogAndroid.actionPositive) {
                        // Positive
                        const credential = auth.EmailAuthProvider.credential(currentUser.email, text);
                        const reAuth = currentUser.reauthenticateWithCredential(credential);
                        reAuth.then(async () => {
                            try {
                                // Authentication
                                const auth = Library.authentication;
                                const currentUser = auth().currentUser;
                                const deleteUser = currentUser.delete();
                                deleteUser.then(() => { console.log("User authentication deleted"); });
                                deleteUser.catch(error => { console.log("Error: ", error); });
                            } catch (error) { console.log("Error: ", error); }
                        });
                        reAuth.catch(error => { Library.DialogAndroid.alert("Error: ", error); });
                    } else if (action === Library.DialogAndroid.actionDismiss) {
                        // Dismiss
                        console.log('dismissed!');
                    }
                } catch (error) { console.log("Error: ", error); }
            });
            userDocument.catch(error => { console.log("Error: ", error); });
        } catch (error) { console.log("Error: ", error); }
    }

    async logoutAccount() {
        try {
            const { action } = await Library.DialogAndroid.alert("Logout Account", "Are you sure you want to logout your accout?", {
                positiveText: "Yes",
                negativeText: "No"
            });
            switch (action) {
                case Library.DialogAndroid.actionPositive:
                    try {
                        console.log('positive!');
                        const auth = Library.authentication();
                        await auth.signOut();
                        await Library.Storage.removeItem("Active");
                        this.unsubscribe = auth.onAuthStateChanged(this.userStatus.bind(this));
                    } catch (error) { console.log("Error: ", error); }
                    break;
                case Library.DialogAndroid.actionNegative:
                    console.log('negative!');
                    break;
                case Library.DialogAndroid.actionNeutral:
                    console.log('neutral!');
                    break;
                case Library.DialogAndroid.actionDismiss:
                    console.log('dismissed!');
                    break;
            }
        } catch (error) { console.log("Error: ", error); }
    }

    async userStatus(user) {
        try {
            const value = await Library.Storage.getItem("Active");
            console.log("value: ", value, "user: ", user);
            if ((value === null) && (user === null)) {
                return Library.Nav.setRoot({
                    root: {
                        stack: {
                            children: [
                                {
                                    component: {
                                        name: 'Overview'
                                    }
                                }
                            ],
                            options: {
                                animations: {
                                    setRoot: {
                                        waitForRender: true
                                    }
                                }
                            }
                        }
                    }
                });
            }
        } catch (error) { console.log("Error: ", error); }
    }

    deleteCleaned(key, item) {
        if (this.state.cleanedID.length === 1) {
            this.state.cleanedID = [];
            this.setState({ cleanedID: this.state.cleanedID }, () => {
                this.storage.removedCleanedJob(key, item);
            });
        } else {
            const stateArray = this.state.cleanedID;
            const stateData = this.state.cleaned;

            const indexArray = [...stateArray];
            const indexData = [...stateData];

            const items = "" + item
            const position = indexArray.indexOf(items);
            indexArray.splice(position, 1);
            this.state.cleanedID = indexArray;
            this.setState({ cleanedID: this.state.cleanedID }, () => {
                this.storage.removedCleanedJob(key, item);
            });

            const newData = indexData.filter(value => value.id != item);
            this.state.cleaned = newData;
            this.setState({ cleaned: this.state.cleaned });
        }
    }

    render() {
        return (
            <Library.Base.Root>
                <Library.Base.Container>
                    <Library.Base.Header
                        androidStatusBarColor="#05dee2"
                        style={{
                            backgroundColor: "#05dee2",
                            marginTop: "7.5%",
                            elevation: 0
                        }}>
                        <Library.Base.Left>
                            <Library.Base.Button transparent>
                                <Library.Base.Icon name='md-home-outline' />
                            </Library.Base.Button>
                        </Library.Base.Left>
                        <Library.Base.Body>
                            <Library.Base.Title>Home</Library.Base.Title>
                        </Library.Base.Body>
                        <Library.Base.Right>
                            {/* <Library.Base.Button
                                onPress={
                                    () => Library.Nav.push(this.props.componentId, {
                                        component: {
                                            name: "Status"
                                        }
                                    })
                                }
                                transparent
                                badge>
                                <Library.Base.Badge>
                                    <Library.Base.Text>51</Library.Base.Text>
                                </Library.Base.Badge>
                                <Library.Base.Icon name='md-notifications-outline' />
                            </Library.Base.Button> */}
                            <Library.Base.Button
                                onPress={this.onSetting.bind(this)}
                                transparent
                                badge>
                                {/* <Library.Base.Badge>
                                    <Library.Base.Text>51</Library.Base.Text>
                                </Library.Base.Badge> */}
                                <Library.Base.Icon name='md-settings-outline' />
                            </Library.Base.Button>
                        </Library.Base.Right>
                    </Library.Base.Header>
                    <Library.Base.Content padder>
                        <Library.Base.List>
                            {
                                (this.state.made.length !== 0) ? (
                                    <>
                                        <Library.Base.ListItem itemDivider>
                                            <Library.Base.Text>Made</Library.Base.Text>
                                        </Library.Base.ListItem>
                                        {
                                            this.state.made.map((value, key) => (
                                                <Library.Base.ListItem key={key}>
                                                    <Library.Box.Grid>
                                                        <Library.Box.Col style={{ justifyContent: 'flex-start' }}>
                                                            <Library.Base.Text style={{ alignSelf: 'flex-start' }}>
                                                                {`${value.name} Room`}
                                                            </Library.Base.Text>
                                                            <Library.Base.Text note style={{ alignSelf: 'flex-start' }}>
                                                                {`Created at ${value.date}`}
                                                            </Library.Base.Text>
                                                        </Library.Box.Col>
                                                        <Library.Box.Col style={{ justifyContent: 'flex-end' }}>
                                                            <Library.Base.Button
                                                                onPress={() => this.deleteMade(value.id)}
                                                                style={{
                                                                    alignSelf: "flex-end",
                                                                    backgroundColor: "#fcc4c3"
                                                                }}>
                                                                <Library.Base.Text>Delete</Library.Base.Text>
                                                            </Library.Base.Button>
                                                        </Library.Box.Col>
                                                    </Library.Box.Grid>
                                                </Library.Base.ListItem>
                                            ))
                                        }
                                    </>
                                ) : (
                                    <Library.Base.ListItem itemDivider style={{ marginBottom: 5 }}>
                                        <Library.Base.Text>Empty Made</Library.Base.Text>
                                    </Library.Base.ListItem>
                                )
                            }
                            {
                                (this.state.cleanedID.length !== 0) && this.state.cleaned.length !== 0 ? (
                                    <>
                                        <Library.Base.ListItem itemDivider>
                                            <Library.Base.Text>Cleaned</Library.Base.Text>
                                        </Library.Base.ListItem>
                                        {
                                            this.state.cleaned.map((value, key) => (
                                                <Library.Base.ListItem key={key}>
                                                    <Library.Box.Grid>
                                                        <Library.Box.Col style={{ justifyContent: 'flex-start' }}>
                                                            <Library.Base.Text style={{ alignSelf: 'flex-start' }}>
                                                                {`${value.name} Room`}
                                                            </Library.Base.Text>
                                                            <Library.Base.Text note style={{ alignSelf: 'flex-start' }}>
                                                                {`Created at ${value.date}`}
                                                            </Library.Base.Text>
                                                        </Library.Box.Col>
                                                        <Library.Box.Col style={{ justifyContent: 'flex-end' }}>
                                                            <Library.Base.Button
                                                                onPress={() => this.deleteCleaned("cleaning", value.UID)}
                                                                style={{
                                                                    alignSelf: "flex-end",
                                                                    backgroundColor: "#fcc4c3"
                                                                }}>
                                                                <Library.Base.Text>Delete</Library.Base.Text>
                                                            </Library.Base.Button>
                                                        </Library.Box.Col>
                                                    </Library.Box.Grid>
                                                </Library.Base.ListItem>
                                            ))
                                        }
                                    </>
                                ) : (
                                    <Library.Base.ListItem itemDivider>
                                        <Library.Base.Text>Empty Cleaned</Library.Base.Text>
                                    </Library.Base.ListItem>
                                )
                            }
                        </Library.Base.List>
                    </Library.Base.Content>
                    <Template.Footer {...this.props} page="Home" />
                </Library.Base.Container>
            </Library.Base.Root>
        );
    }

    parseJSONCleanedJob(key, value) {
        var condition = (typeof value == "string");
        if (condition) {
            this.state.cleanedID.push([key, value]);
            this.setState({ cleanedID: this.state.cleanedID }, this.callfetchDataOnInitialState);
        }
    }

    async callfetchDataOnInitialState() {
        try {
            const auth = Library.authentication();
            const id = auth.currentUser.uid;
            const fire = Library.firestore();
            const usersCOL = fire.collection("users");
            for (let i = 0, l = this.state.cleanedID.length; i < l; i++) {
                const UID = this.state.cleanedID[i][0];
                const postID = this.state.cleanedID[i][1];
                const condition = (id != UID)
                if (condition) {
                    const user = usersCOL.doc(UID);
                    const userDATA = await user.get();
                    const userGetData = userDATA.data();
                    const userMADE = user.collection("made");
                    const userPostData = await userMADE.doc(postID).get();
                    const condition = userPostData.exists;
                    if (condition) {
                        const userGetPostData = userPostData.data();
                        const name = userGetPostData.name;
                        const author = userGetData.author.full;
                        console.log("author: ", author);
                        const date = Library.moment(userGetPostData.date.timestamp).format("MMMM DD YYYY");
                        const data =
                        {
                            UID: UID,
                            date: date,
                            name: name,
                            author: author
                        };
                        this.state.cleaned.push(data);
                        this.setState({ cleaned: this.state.cleaned });
                    }
                }
            }
        } catch (e) { console.log("Error: ", error); }
    }

    // Note: These code may need in the future
    /*     callfetchCleanJobData() {
            Data.Data.user.map(this.fetchCleanJobData.bind(this));
        }
    
        fetchCleanJobData(value) {
            for (let i = 0, l = this.state.cleanedID.length; i <= l; i++) {
                if (this.state.cleanedID[i] == value.id) {
                    this.state.cleaned.push(value);
                    const stateArray = this.state.cleaned;
                    const setArray = new Set(stateArray);
                    const newArray = [...setArray];
                    this.state.cleaned = newArray;
                    this.setState({ cleaned: this.state.cleaned });
                }
            }
        } */

    async componentDidMount() {
        try {
            /* return Library.Nav.setRoot({
                root: {
                    stack: {
                        children: [
                            {
                                component: {
                                    name: 'Overview'
                                }
                            }
                        ],
                        options: {
                            animations: {
                                setRoot: {
                                    waitForRender: true
                                }
                            }
                        }
                    }
                }
            }); */
            const auth = Library.authentication();
            const fire = Library.firestore();
            const id = auth.currentUser.uid;
            const usersCOL = fire.collection("users");
            const usersDOC = usersCOL.doc(id);
            const madeCOL = usersDOC.collection("made");
            const isMadeCOLExist = await madeCOL.get();
            var condition = !isMadeCOLExist.empty;
            console.log("condition: ", condition);
            if (condition) {
                const current = madeCOL.where("date.timestamp", ">", Library.moment.utc().valueOf());
                const value = await current.limit(10).orderBy("date.timestamp", "desc").get();
                // const value = await madeCOL.limit(10).orderBy("date.timestamp", "desc").get();
                const document = value.docs;
                for (let i = 0, l = document.length; i < l; i++) {
                    const object = document[i].data();
                    const documentID = document[i].id;
                    const name = object.name;
                    const date = Library.moment(object.date.timestamp).format("MMMM DD YYYY");
                    const data = { id: documentID, name: name, date: date };
                    this.state.made.push(data);
                    this.setState({ made: this.state.made });
                }
            }

            // await this.storage.Clear();
            const value = await this.storage.GetAllKeys();
            const length = (value.length - 1);
            var condition = ((length !== 0) && value !== undefined);
            if (condition) {
                const cleaned = value.filter(v => v == "cleaning")[0];
                var condition = (cleaned != null);
                if (condition) {
                    const cleanedJob = await this.storage.GetData(cleaned);
                    JSON.parse(cleanedJob, this.parseJSONCleanedJob.bind(this));
                }
            } else {
                console.log("Empty");
                this.state.cleanedID = [];
                this.setState({ cleaned: this.state.cleanedID });
            }
            Library.SplashScreen.hide();
            this.unsubscribe = auth.onAuthStateChanged(this.userStatus.bind(this));
            Library.Native.BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
        } catch (error) { console.log("Error: ", error); }
    }

    componentWillUnmount() {
        Library.Native.BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
        this.setState = () => null;
        return this.unsubscribe;
    }

    onBackPress = () => {
        return true;
    }

}