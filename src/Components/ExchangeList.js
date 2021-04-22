import React, {Component} from "react";
import CryptoCard from "./CryptoCard";
import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";
import {withRouter} from "react-router-dom";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import {Container} from "@material-ui/core";
import SearchIcon from '@material-ui/icons/Search';

class ExchangeList extends Component {
    constructor(props){
        super(props);

        this.state = {
            data: [],
            images: {},
            searched: [],
            loader: true,
            searchField: ""
        }

        this.searchExchanges = this.searchExchanges.bind(this);
    }

    async componentDidMount() {
        let headers = {
            'Content-Type': 'application/json',
            'X-CoinAPI-Key': process.env.REACT_APP_APIKEY,
        }

        let data = await fetch('https://rest.coinapi.io/v1/exchanges', {headers: headers})
            .then(res => res.json())
            .catch(err => console.error(err));

        if(data.error) data = [];

        let images = await fetch('https://rest.coinapi.io/v1/exchanges/icons/64', {headers: headers})
            .then(res => res.json())
            .catch(err => console.error(err));

        if(images.error) images = {};

        this.setState({
            data: data,
            images: images,
            searched: data,
            loader: false
        });
    }

    navigate(exchangeId, img){
        this.props.history.push({
            pathname: '/exchange/'+exchangeId,
            logo: img
        });
    }

    searchExchanges(e){
        e.preventDefault();

        let result = this.state.data.filter(exchange => {
            return exchange.name.toLowerCase().includes(this.state.searchField.toLowerCase());
        });
        this.setState({
            searched: result
        });
    }

    render(){

        let sortedSearch = [];
        if(this.state.searched){
            sortedSearch = this.state.searched.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);
        }

        return (
            <div>
                {this.state.loader ?
                    <Grid container direction={"row"} justify={"center"} alignItems={"center"}>
                        <Grid item>
                            <CircularProgress/>
                        </Grid>
                    </Grid>
                    :
                    <Container>
                        <form onSubmit={this.searchExchanges}>
                            <TextField type={"search"} placeholder={"Search Exchanges"} onChange={e => this.setState({searchField: e.target.value})}/>
                            <Button type={"submit"} variant={"outlined"} size={"small"}><SearchIcon fontSize={"large"}/></Button>
                        </form>
                        <Grid container spacing={3}>
                            {
                                sortedSearch.map(exchange => {
                                    let img = this.state.images.find(image => image.exchange_id===exchange.exchange_id)

                                    return (
                                        <Grid item md={3} key={exchange.exchange_id}  onClick={() => this.navigate(exchange.exchange_id, img)}>
                                            <CryptoCard data={exchange} image={img}/>
                                        </Grid>
                                    )
                                })
                            }
                            {
                                this.state.searched.length===0 && (
                                    <p>Exchanges failed to load.</p>
                                )
                            }
                        </Grid>
                    </Container>
                }
            </div>
        );
    }
}

export default withRouter(ExchangeList);