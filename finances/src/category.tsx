import { Component } from "react";
import Modal from "react-modal";
import { Button, Header, Input } from "semantic-ui-react";
import { callAPI } from "./api";

const customStyles = {
    content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)",
    },
};

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement("#root");

interface Props {
    onClose: (reload?: boolean) => void;
    categoryDescription: string;
    category: string;
}

interface State {
    category: string;
}

class CategoryModal extends Component<Props, State> {
    state = {
        category: this.props.category,
    };

    async onUpdate() {
        const data = await callAPI("finances", ["category"], {
            email: (localStorage.getItem("email") || "").replace(/"/g, ""),
            category: this.state.category,
            description: this.props.categoryDescription,
        });
        console.log(data);
        this.props.onClose(true);
    }

    render() {
        return (
            <Modal style={customStyles} isOpen={true}>
                <div>
                    <Header as={"h3"}>Category for description</Header>
                    <Header as={"h4"}>{this.props.categoryDescription}</Header>
                    <span style={{ marginRight: "5px" }}>
                        <Input
                            placeholder="Category"
                            onChange={(e) =>
                                this.setState({ category: e.target.value })
                            }
                            value={this.state.category}
                        />
                    </span>
                    <Button onClick={this.onUpdate.bind(this)}>Update</Button>
                    <Button onClick={() => this.props.onClose()}>Close</Button>
                </div>
            </Modal>
        );
    }
}

export default CategoryModal;
