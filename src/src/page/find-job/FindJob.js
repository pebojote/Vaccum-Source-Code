import * as React from 'react';
import * as Library from '../../abstract-library';
import * as Helper from '../../abstract-helper';
import * as Template from '../../abstract-template';
import * as Data from '../../abstract-data';
import { hour, user } from '../../data/data';

Library.Native.UIManager.setLayoutAnimationEnabledExperimental(true);

export default class FindJob extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            ...this.state
        }
        this.storage = new Helper.StorageMethod();
    }


    state = {
        search: [],
        expand: false,
        searchbutton: [],
        cleaned: [],
        history: [],
        cancelkeyboard: Library.Native.Keyboard.dismiss,
        data: [],
        findjobstatus: "Loading..."
    }

    cleaned(postID) {
        if (this.state.cleaned !== undefined) {
            this.state.cleaned.push(postID);
            this.setState({ cleaned: this.state.cleaned });
        }
    }

    deleteHistory(key) {
        this.state.history = [];
        this.setState({ history: this.state.history });
        this.storage.RemoveValue(key);
    }

    SearchEngineTerm(value) {
        console.log("Line 46: ", value);
        this.state.search[0] = value;
        this.setState({ search: this.state.search });
    }

    isFocused() {
        Library.Native.LayoutAnimation.configureNext(
            {
                duration: 700,
                create: { type: 'linear', property: 'opacity' },
                update: { type: 'spring', springDamping: 0.4 },
                delete: { type: 'linear', property: 'opacity' }
            }
        )
        this.setState({ expand: true }, () => {
            try {
                this.SearchExit.play();
                setTimeout(() => {
                    try {
                        this.SearchExit.pause();
                    } catch (e) {
                        ``
                    }
                }, 2000)
            } catch (e) {
                console.log(e.message);
            }
        });
    }

    isBackSpaced() {
        this.state.searchbutton = [];
        this.setState({ searchbutton: this.state.searchbutton });
    }

    isFocusedExitButton() {
        Library.Native.LayoutAnimation.configureNext(
            {
                duration: 700,
                create: { type: 'linear', property: 'opacity' },
                update: { type: 'spring', springDamping: 0.4 },
                delete: { type: 'linear', property: 'opacity' }
            }
        )
        this.setState({ expand: false }, () => {
            this.state.search = [];
        });
        this.state.cancelkeyboard = Library.Native.Keyboard.dismiss();
        this.setState({ cancelkeyboard: this.state.cancelkeyboard })
    }

    async InButtonSearched() {
        // Search Term
        if (this.state.search.length !== 0) {
            const SearchTerm = this.state.search.slice(0, 1)[0];
            if (/^[A-Za-z]+$/.test(SearchTerm) || /^[a-zA-Z\s]*$/.test(SearchTerm)) {
                this.CanonizeString = SearchTerm.toLowerCase().replace(/\s/g, "");
                await this.storage.StoreData("history", SearchTerm);
            }

            if (/^\d+$/.test(SearchTerm) || /^[+-]?\d+(\.\d+)?$/.test(SearchTerm)) {
                if (+SearchTerm === 0) {
                    this.CanonizeNumber = 1;
                    console.log("History: ", SearchTerm);
                    await this.storage.StoreData("history", "" + SearchTerm);
                } else {
                    this.CanonizeNumber = +SearchTerm;
                    console.log("History: ", SearchTerm);
                    await this.storage.StoreData("history", "" + SearchTerm);
                }
            }
            // Search Author
            const AuthorFirst = this.state.data.filter((value) => {
                const AuthorFirst = value.author.first;
                const LowerAuthorFirstAndRemoveSpace = AuthorFirst.toLocaleLowerCase().replace(/\s/g, "");
                if (LowerAuthorFirstAndRemoveSpace === this.CanonizeString) {
                    return AuthorFirst;
                }
            }) || 1;
            const FirstAuthor = AuthorFirst.length !== 0 ? AuthorFirst[0].author.first.toLocaleLowerCase().replace(/\s/g, "") : false;

            const AuthorLast = this.state.data.filter((value) => {
                const AuthorLast = value.author.last;
                const LowerAuthorLastAndRemoveSpace = AuthorLast.toLocaleLowerCase().replace(/\s/g, "");
                if (LowerAuthorLastAndRemoveSpace === this.CanonizeString) {
                    return AuthorLast;
                }
            }) || 1;
            const LastAuthor = AuthorLast.length !== 0 ? AuthorLast[0].author.last.toLocaleLowerCase().replace(/\s/g, "") : false;

            const Author = this.state.data.filter((value) => {
                const author = value.author;
                const AuthorFirst = value.author.first;
                const AuthorLast = value.author.last;
                const LowerAuthorFirstAndRemoveSpace = AuthorFirst.toLocaleLowerCase().replace(/\s/g, "");
                const LowerAuthorLastAndRemoveSpace = AuthorLast.toLocaleLowerCase().replace(/\s/g, "");
                const FullName = `${LowerAuthorFirstAndRemoveSpace}${LowerAuthorLastAndRemoveSpace}`;
                if (FullName === this.CanonizeString) {
                    return author;
                }
            }) || 1;
            const author = Author.length !== 0 ? `${Author[0].author.first.toLocaleLowerCase().replace(/\s/g, "")}${Author[0].author.last.toLocaleLowerCase().replace(/\s/g, "")}` : false

            // Search Location
            const Location = this.state.data.filter((value) => {
                const location = value.location;
                const LowerLocationAndRemoveSpace = location.toLocaleLowerCase().replace(/\s/g, "");
                if (LowerLocationAndRemoveSpace === this.CanonizeString) {
                    return location;
                }
            }) || 1;
            const location = Location.length !== 0 ? Location[0].location.toLocaleLowerCase().replace(/\s/g, "") : false;

            // Search Reward
            const Reward = this.state.data.filter((value) => {
                const reward = value.reward;
                if (value.reward == this.CanonizeNumber) {
                    return reward;
                }
            }) || 1;
            const reward = Reward.length !== 0 ? Reward[0].reward : false;
            // Search Name
            const Name = this.state.data.filter((value) => {
                const name = value.name;
                const LowerNameAndRemoveSpace = name.toLocaleLowerCase().replace(/\s/g, "");
                if (LowerNameAndRemoveSpace === this.CanonizeString) {
                    return name;
                }
            }) || 1;
            const name = Name.length !== 0 ? Name[0].name.toLocaleLowerCase().replace(/\s/g, "") : false;

            if (this.CanonizeString) {
                switch (this.CanonizeString) {
                    case FirstAuthor:
                        this.state.searchbutton = AuthorFirst;
                        this.setState({ searchbutton: this.state.searchbutton });
                        break;
                    case LastAuthor:
                        this.state.searchbutton = AuthorLast;
                        this.setState({ searchbutton: this.state.searchbutton });
                        break;
                    case author:
                        this.state.searchbutton = Author;
                        this.setState({ searchbutton: this.state.searchbutton });
                        break;
                    case location:
                        this.state.searchbutton = Location;
                        this.setState({ searchbutton: this.state.searchbutton });
                        break;
                    case name:
                        this.state.searchbutton = Name;
                        this.setState({ searchbutton: this.state.searchbutton });
                        break;
                    default:
                        Library.DialogAndroid.alert("Not Found", `${SearchTerm} is not found!`)
                }
            } else if (this.CanonizeNumber) {
                switch (this.CanonizeNumber) {
                    case reward:
                        this.state.searchbutton = Reward;
                        this.setState({ searchbutton: this.state.searchbutton });
                        break;
                    default:
                        Library.DialogAndroid.alert("Not Found", `${SearchTerm} is not found!`)
                }
            }
        }
    }

    SearchQuery(ValueInSearchInput) {
        console.log("Line 216: ", ValueInSearchInput);
        this.ValueInSearchInput = ValueInSearchInput;
        return this.state.data.filter(this.SearchQueryFilter.bind(this)).map(this.SearchQueryMap.bind(this));
    }

    SearchQueryFilter(ValueInStorage) {
        if (/^[A-Za-z]+$/.test(this.ValueInSearchInput) || /^[a-zA-Z\s]*$/.test(this.ValueInSearchInput)) {
            this.CanonizeSearchString = this.ValueInSearchInput.toLowerCase().replace(/\s/g, "");

        }

        if (/^\d+$/.test(this.ValueInSearchInput) || /^[+-]?\d+(\.\d+)?$/.test(this.ValueInSearchInput)) {
            this.CanonizeSearchNumber = +this.ValueInSearchInput;
        }

        const first = ValueInStorage.author.first.toLowerCase().replace(/\s/g, "");
        const last = ValueInStorage.author.last.toLowerCase().replace(/\s/g, "");
        const FullName = `${first}${last}`;
        const location = ValueInStorage.location.toLowerCase().replace(/\s/g, "");
        const reward = +ValueInStorage.reward;
        const name = ValueInStorage.name.toLowerCase().replace(/\s/g, "");

        if (this.CanonizeSearchString == first) {
            return this.ValueInSearchInput;
        }
        if (this.CanonizeSearchString == last) {
            return this.ValueInSearchInput;
        }

        if (this.CanonizeSearchString == FullName) {
            return this.ValueInSearchInput;
        }

        if (this.CanonizeSearchString == location) {
            return this.ValueInSearchInput;
        }

        if (this.CanonizeSearchNumber == reward) {
            return this.ValueInSearchInput;
        }

        if ((this.CanonizeSearchString == name) || this.CanonizeSearchString == `${name}room`) {
            return this.ValueInSearchInput;
        }
    }

    SearchQueryMap(value, key) {

        if (this.state.cleaned.length !== 0) {
            this.SearchQueryMapCondition = this.state.cleaned.every(v => v != value.postID);
        } else {
            this.SearchQueryMapCondition = true;
        }

        if (this.SearchQueryMapCondition) {
            return (
                <Library.Base.ListItem avatar key={key} style={{ backgroundColor: "#e4f7fd" }}>
                    <Template.Dialog
                        cleaned={this.cleaned.bind(this)}
                        value={value} />
                </Library.Base.ListItem>
            );
        }
    }

    render() {
        return (
            <Library.Base.Container style={{ backgroundColor: "#e5f8f5" }}>
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
                    <Library.Base.Title>Find</Library.Base.Title>
                </Library.Base.Header>
                {/* <Library.Base.Header
                    androidStatusBarColor="#05dee2"
                    searchBar
                    rounded
                    style={{

                        backgroundColor: "#05dee2",
                        marginTop: "7.5%",
                        elevation: 0,
                        justifyContent: "center",
                        alignItems: "center",
                        alignContent: "center"
                    }}>
                    <Library.Base.Item>
                        <Library.Base.Icon name="search" />
                        <Library.Base.Input
                            onFocus={() => {
                                this.isFocused();
                            }}
                            onKeyPress={({ nativeEvent }) => {
                                if (nativeEvent.key === "Backspace") {
                                    this.isBackSpaced();
                                }
                            }}
                            autoFocus={false}
                            onSubmitEditing={this.state.cancelkeyboard}
                            placeholder="Search"
                            onChangeText={(value) => this.SearchEngineTerm(value)} />
                        <Library.Base.Icon name="ios-people" />
                    </Library.Base.Item>
                    <Library.Native.TouchableOpacity
                        style={{ padding: 5 }}
                        onPress={() => this.InButtonSearched()}>
                        <Library.Base.H3 style={{ color: "#ffffff" }}>Search</Library.Base.H3>
                    </Library.Native.TouchableOpacity>
                </Library.Base.Header> */}
                {this.state.expand && (
                    <Library.Box.Grid style={{ backgroundColor: "#e5f8f5" }}>
                        <Library.Box.Row style={{ flexDirection: "column" }}>
                            <Library.Base.List>
                                <Library.Base.ListItem itemHeader first>
                                    <Library.Box.Grid>
                                        <Library.Box.Col
                                            style={{
                                                justifyContent: "center",
                                                alignItems: "center",
                                                padding: 5,
                                                margin: 5
                                            }}>
                                            {
                                                (this.state.history.length !== 0) ? (
                                                    <Library.Base.Text>Recent</Library.Base.Text>
                                                ) : (
                                                    <Library.Base.Text>New Explorer</Library.Base.Text>
                                                )
                                            }
                                        </Library.Box.Col>
                                        <Library.Box.Col></Library.Box.Col>
                                        <Library.Box.Col
                                            style={{
                                                justifyContent: "center",
                                                alignItems: "center",
                                                padding: 5,
                                                margin: 5
                                            }}>
                                            <Library.Base.Button
                                                transparent
                                                style={{
                                                    borderRadius: 100,
                                                    elevation: 0,
                                                    alignSelf: "center"
                                                }}
                                                onPress={() => this.isFocusedExitButton()}>
                                                <Library.Animated
                                                    source={require('../../assets/animation/lottie/13865-sign-for-error-flat-style.json')}
                                                    style={{ width: 50, height: 50 }}
                                                    ref={animation => {
                                                        this.SearchExit = animation;
                                                    }} />
                                            </Library.Base.Button>
                                        </Library.Box.Col>
                                    </Library.Box.Grid>
                                </Library.Base.ListItem>
                                {
                                    this.state.history.length !== 0 ? (
                                        <Library.Base.ListItem
                                            key="clean-history"
                                            style={{
                                                backgroundColor: "#e4f7fd",
                                                margin: 10,
                                                borderBottomWidth: 0
                                            }}>
                                            <Library.Native.TouchableOpacity
                                                style={{
                                                    flex: 1,
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    justifyContent: "center"
                                                }}
                                                onPress={() => this.deleteHistory("history")}>
                                                <Library.Base.Text>Press here to clear history</Library.Base.Text>
                                            </Library.Native.TouchableOpacity>
                                        </Library.Base.ListItem>
                                    ) : <Library.Base.Text></Library.Base.Text>
                                }
                                {
                                    this.state.searchbutton.length !== 0 ?
                                        this.state.searchbutton.map(this.SearchQueryMap.bind(this))
                                        :
                                        this.state.search.map(this.SearchQuery.bind(this))
                                }
                                {
                                    (this.state.history.length !== 0) && this.state.history.map(this.SearchQuery.bind(this))
                                }
                            </Library.Base.List>
                        </Library.Box.Row>
                    </Library.Box.Grid>
                )}
                {!this.state.expand && (
                    <Library.Base.Content
                        padder
                        contentContainerStyle={{
                            backgroundColor: "#e5f8f5",
                            justifyContent: "center"
                        }}>
                        <Library.Box.Grid>
                            <Library.Box.Row style={{ justifyContent: "center", alignItems: "center", padding: 10 }}>
                                <Library.Base.Text>{this.state.findjobstatus}</Library.Base.Text>
                            </Library.Box.Row>
                        </Library.Box.Grid>
                        {
                            this.state.data.map((value, key) => {
                                const condition = this.state.cleaned.every(v => v != value.postID);
                                if (condition) {
                                    return <Template.Clean
                                        page={"Find Job"}
                                        cleaned={this.cleaned.bind(this)}
                                        key={key}
                                        data={value} />;
                                }
                            })
                        }
                    </Library.Base.Content>
                )}

                <Template.Footer {...this.props} page="Find Job" />
            </Library.Base.Container>
        );
    }

    parseJSONCleanJob(key, value) {
        var condition = (typeof value == "string");
        if (condition) {
            this.state.cleaned.push(value);
            this.setState({ cleaned: this.state.cleaned }, this.callfetchDataOnInitialState);
        }
    }

    async callfetchDataOnInitialState() {
        try {
            const auth = Library.authentication();
            const fire = Library.firestore();
            const id = auth.currentUser.uid;
            const usersCOL = fire.collection("users");
            const usersDOC = usersCOL.doc(id);
            const usersField = await usersDOC.get();
            const usersFieldPATH = new Library.firebase.firestore.FieldPath("location");
            const usersLocation = usersField.get(usersFieldPATH)
            // Todo: Composite Index to avoid calling your own UID
            const location = usersCOL.where("location", "==", usersLocation);
            const value = await location.limit(10).get();
            const documentUSER = value.docs;
            for (let i = 0, l1 = documentUSER.length; i < l1; i++) {
                const documentID = documentUSER[i].id;
                if (documentID !== id) {
                    const userDATA = usersCOL.doc(documentID);
                    const userDATAGET = await userDATA.get();
                    const userDATAOBJECT = userDATAGET.data();
                    const author = userDATAOBJECT.author;
                    const image = userDATAOBJECT.image;
                    const location = userDATAOBJECT.location;
                    const isMade = await userDATA.collection("made").get();
                    if (!isMade.empty) {
                        const documentMADE = isMade.docs;
                        for (let j = 0, l2 = documentMADE.length; j < l2; j++) {
                            const objectMADE = documentMADE[j].data();
                            const name = objectMADE.name;
                            const reward = objectMADE.reward;
                            const date = Library.moment(objectMADE.date.timestamp).format("MMMM DD YYYY");
                            const day = Library.moment(objectMADE.date.dateString).format("dddd");
                            const hour = objectMADE.hour;
                            const description = objectMADE.description;
                            const task = objectMADE.task;
                            const data =
                            {
                                id: documentID,
                                postID: documentMADE[j].id,
                                name: name,
                                author: author,
                                image: image,
                                location: location,
                                hour: hour,
                                reward: reward,
                                date: date,
                                day: day,
                                description: description,
                                task: task
                            };

                            console.log("data: ", data);
                            this.state.data.push(data);
                            this.setState({ data: this.state.data });
                        }
                        this.state.findjobstatus = "Todo List";
                        this.setState({ findjobstatus: this.state.findjobstatus });
                    } else {
                        this.state.findjobstatus = "Todo List";
                        this.setState({ findjobstatus: this.state.findjobstatus });
                    }
                }
            }
        } catch (e) {

        }
    }

    // Note: These code may need in the future
    /*     callfetchCleanJobData() {
            Data.Data.user.map(this.fetchCleanJobData.bind(this));
        }
    
        fetchCleanJobData(value) {
            for (let i = 0, l = this.state.cleaned.length; i <= l; i++) {
                if (this.state.cleaned[i] == value.id) {
                    if (value.location === "Paltic") {
                        this.state.data.push(value);
                        const stateArray = this.state.data;
                        const setArray = new Set(stateArray);
                        const newArray = [...setArray];
                        this.state.data = newArray;
                        this.setState({ data: this.state.data });
                    }
                }
            }
        } */

    parseJSONHistory(key, value) {
        if (typeof value == "string") {
            this.state.history.push(value)
            this.setState({ history: this.state.history });
            Data.Data.user.map(this.fetchHistoryData.bind(this));
        }
    }

    fetchHistoryData(value) {
        this.state.data.push(value);
        this.setState({ data: this.state.data });
    }

    async componentDidMount() {
        try {
            // await this.storage.Clear();
            const value = await this.storage.GetAllKeys();
            const length = (value.length - 1);
            var condition = ((length !== 0) && value !== undefined);
            if (condition) {
                const cleaned = value.filter(v => v == "cleaning")[0];
                var condition = (cleaned != null);
                if (condition) {
                    const CleanedJob = await this.storage.GetData(cleaned);
                    JSON.parse(CleanedJob, this.parseJSONCleanJob.bind(this));
                }
                const history = value.filter(v => v == "history")[0];
                var condition = (history != null);
                if (condition) {
                    const HistoryValue = await this.storage.GetData(history);
                    JSON.parse(HistoryValue, this.parseJSONHistory.bind(this));
                }
            } else {
                this.state.findjobstatus = "Todo List";
                this.setState({ findjobstatus: this.state.findjobstatus });
                this.state.cleaned = [];
                this.setState({ cleaned: this.state.cleaned }, this.callfetchDataOnInitialState);
            }
            Library.Native.BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
        } catch (e) { }
    }

    componentWillUnmount() {
        Library.Native.BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
        this.setState = () => null;
    }

    onBackPress = () => {
        return true;
    }
}