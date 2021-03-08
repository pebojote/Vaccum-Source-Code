import React from 'react';
import * as Library from '../../abstract-library';
import * as Helper from '../../abstract-helper';
import * as Data from '../../abstract-data';
import * as Template from '../../abstract-template';

export default class CleanedJob extends React.Component {

    constructor(props) {
        super(props);
        this.storage = new Helper.StorageMethod();
    }

    state = {
        cleaned: [],
        data: []
    }

    deleteCleaned(key, item) {
        if (this.state.cleaned.length === 1) {
            this.state.cleaned = [];
            this.setState({ cleaned: this.state.cleaned }, () => {
                this.storage.removedCleanedJob(key, item);
            });
        } else {
            const stateArray = this.state.cleaned;
            const stateData = this.state.data;

            const indexArray = [...stateArray];
            const indexData = [...stateData];

            const items = "" + item
            const position = indexArray.indexOf(items);
            indexArray.splice(position, 1);
            this.state.cleaned = indexArray;
            this.setState({ cleaned: this.state.cleaned }, () => {
                this.storage.removedCleanedJob(key, item);
            });

            const newData = indexData.filter(value => value.id != item);
            this.state.data = newData;
            this.setState({ data: this.state.data });
        }
    }

    render() {
        return (
            <Library.Base.Container>
                <Library.Base.Header
                    androidStatusBarColor="#05dee2"
                    style={{
                        backgroundColor: "#05dee2",
                        marginTop: "7.5%",
                        elevation: 0,
                        justifyContent: "center",
                        alignItems: "center",
                        alignContent: "center"
                    }}>
                    <Library.Base.Title>Cleaned Job</Library.Base.Title>
                </Library.Base.Header>
                {
                    (this.state.cleaned.length !== 0) && this.state.data.length !== 0 ? (
                        <Library.Base.Content padder>
                            <Library.Base.List>
                                <Library.Base.ListItem itemHeader first>
                                    <Library.Base.Text>Cleaned Job</Library.Base.Text>
                                </Library.Base.ListItem>
                                {
                                    this.state.data.map((value, key) => (
                                        <Library.Base.ListItem key={key}>
                                            <Library.Box.Grid>
                                                <Library.Box.Col style={{ padding: 5 }}>
                                                    <Library.Box.Row>
                                                        <Library.Base.Text>{`${value.author}`}</Library.Base.Text>
                                                    </Library.Box.Row>
                                                    <Library.Box.Row>
                                                        <Library.Base.Text note>
                                                            {`${value.name} Room`}
                                                        </Library.Base.Text>
                                                    </Library.Box.Row>
                                                </Library.Box.Col>
                                                <Library.Box.Col style={{ justifyContent: "center", padding: 5 }}>
                                                    <Library.Base.Button
                                                        onPress={() => this.deleteCleaned("cleaning", value.UID)}
                                                        style={{
                                                            alignSelf: "flex-end",
                                                            elevation: 0,
                                                            borderRadius: 5,
                                                            backgroundColor: "#fcc4c3"
                                                        }}>
                                                        <Library.Base.Text>Delete</Library.Base.Text>
                                                    </Library.Base.Button>
                                                </Library.Box.Col>
                                            </Library.Box.Grid>
                                        </Library.Base.ListItem>
                                    ))
                                }
                            </Library.Base.List>
                        </Library.Base.Content>
                    ) : (
                            <Library.Box.Grid>
                                <Library.Box.Col style={{ justifyContent: "center", alignItems: "center" }}>
                                    <Library.Animated
                                        source={require('../../assets/animation/lottie/8021-empty-and-lost.json')}
                                        style={{ alignSelf: "center" }}
                                        autoSize
                                        autoPlay
                                        resizeMode="center" />
                                </Library.Box.Col>
                            </Library.Box.Grid>
                        )
                }
                <Template.Footer {...this.props} page="Cleaned Job" />
            </Library.Base.Container >
        );
    }

    parseJSONCleanedJob(key, value) {
        var condition = (typeof value == "string");
        if (condition) {
            this.state.cleaned.push([key, value]);
            this.setState({ cleaned: this.state.cleaned }, this.callfetchDataOnInitialState);
        }
    }

    async callfetchDataOnInitialState() {
        try {
            const auth = Library.authentication();
            const id = auth.currentUser.uid;
            const fire = Library.firestore();
            const usersCOL = fire.collection("users");
            for (let i = 0, l = this.state.cleaned.length; i < l; i++) {
                const UID = this.state.cleaned[i][0];
                const postID = this.state.cleaned[i][1];
                const condition = (id != UID);
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
                        const data =
                        {
                            UID: UID,
                            name: name,
                            author: author
                        };
                        this.state.data.push(data);
                        this.setState({ data: this.state.data });
                    }
                }
            }
        } catch (e) {

        }
    }

    // Note: These code may need in the future
    /*     callfetchCleanedJobData() {
            Data.Data.user.map(this.fetchCleanedJobData.bind(this));
        }
    
        fetchCleanedJobData(value) {
            for (let i = 0, l = this.state.cleaned.length; i <= l; i++) {
                if (this.state.cleaned[i] == value.id) {
                    this.state.data.push(value);
                    const stateArray = this.state.data;
                    const setArray = new Set(stateArray);
                    const newArray = [...setArray];
                    this.state.data = newArray;
                    this.setState({ data: this.state.data });
                }
            }
        } */

    async componentDidMount() {
        try {
            Library.Native.BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
            // await this.storage.Clear();
            const value = await this.storage.GetAllKeys();
            const length = (value.length - 1);
            var condition = ((length !== 0) && value !== undefined);
            if (condition) {
                const cleaned = value.filter(v => v == "cleaning")[0];
                var condition = (cleaned != null);
                if (condition) {
                    const CleanedJob = await this.storage.GetData(cleaned);
                    JSON.parse(CleanedJob, this.parseJSONCleanedJob.bind(this));
                }
            } else {
                this.state.cleaned = [];
                this.setState({ cleaned: this.state.cleaned });
            }
        } catch (e) {

        }
    }

    componentWillUnmount() {
        Library.Native.BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
    }

    onBackPress = () => {
        return true;
    }
}