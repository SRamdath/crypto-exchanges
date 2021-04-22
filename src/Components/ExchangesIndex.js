import React, {Component} from "react";
import ExchangeList from "./ExchangeList";

class ExchangesIndex extends Component {
    constructor(props){
        super(props);

        this.state = {
        }
    }

    async componentDidMount() {
    }

    render(){
        return (
            <div>
                <h1 className={"pageTitle"}>Crypto Exchanges</h1>
                <ExchangeList/>
            </div>
        );
    }
}

export default ExchangesIndex;