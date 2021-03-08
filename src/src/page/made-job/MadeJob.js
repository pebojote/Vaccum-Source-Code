import * as React from 'react';
import * as Template from '../../abstract-template';
import * as Library from '../../abstract-library';
import * as Data from '../../abstract-data';

export default class MadeJob extends React.Component {

    state = {
        data: []
    }

    deleteMade(id) {
        const newArray = this.state.data.filter(v => v.id != id);
        this.state.data = newArray;
        this.setState({ data: this.state.data }, this.onDelete(id));
    }

    onDelete(key) {
        const id = Library.authentication().currentUser.uid;
        const userCOL = Library.firestore().collection("users");
        const madeCOL = userCOL.doc(id).collection("made");
        madeCOL.doc(key).delete();
    }


    render() {
        return (
            <Library.Base.Container>
                <Library.Base.Header style={{
                    backgroundColor: "#05dee2",
                    marginTop: "7.5%",
                    elevation: 0,
                    justifyContent: "center",
                    alignItems: "center",
                    alignContent: "center"
                }}>
                    <Library.Base.Title>Made Job</Library.Base.Title>
                </Library.Base.Header>
                {
                    (this.state.data.length !== 0) ? (
                        <Library.Base.Content padder>
                            <Library.Base.List>
                                <Library.Base.ListItem itemDivider>
                                    <Library.Base.Text>Latest</Library.Base.Text>
                                </Library.Base.ListItem>
                                {this.state.data.map((value, key) => (
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

                <Template.Footer {...this.props} page="Made Job" />
            </Library.Base.Container>
        );
    }

    async componentDidMount() {
        Library.Native.BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
        const auth = Library.authentication();
        const fire = Library.firestore();
        const id = auth.currentUser.uid;
        const usersCOL = fire.collection("users");
        const usersDOC = usersCOL.doc(id);
        const madeCOL = usersDOC.collection("made");
        const isMadeCOLExist = await madeCOL.get();
        if (!isMadeCOLExist.empty) {
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
                this.state.data.push(data);
                this.setState({ data: this.state.data });
            }
        } else {
            console.log("Empty");
        }
    }

    componentWillUnmount() {
        Library.Native.BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
    }

    onBackPress = () => {
        return true;
    }
}