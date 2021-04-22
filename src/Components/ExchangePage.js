import React, {Component} from "react";
import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";
import Container from "@material-ui/core/Container";
import {withRouter} from "react-router-dom";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Button from "@material-ui/core/Button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Slider from "@material-ui/core/Slider";
import Typography from "@material-ui/core/Typography";

class ExchangePage extends Component {
    constructor(props){
        super(props);

        let date = new Date();

        let endDate = new Date(date.setMinutes(date.getMinutes()-date.getTimezoneOffset()));
        endDate = endDate.toISOString().slice(0, -5);

        let startDate = new Date(date.setSeconds(date.getSeconds()-10));
        startDate = startDate.toISOString().slice(0, -5);

        this.state = {
            exchangeId: "",
            exchange: {},
            logo: this.props.location.img || {},
            assets: {},
            loader: true,
            loader2: false,
            quote: "",
            base: "",
            limit: 100,
            startTime: startDate,
            endTime: endDate,
            graphData: [],
            numTrades: 0,
            graphNote: ""
        };

        this.resetDates = this.resetDates.bind(this);
        this.toggleExpand = this.toggleExpand.bind(this);
        this.fetchSnapshot = this.fetchSnapshot.bind(this);
    }

    async componentDidMount() {
        let exchangeId = this.props.match.params.name;

        let headers = {
            'Content-Type': 'application/json',
            'X-CoinAPI-Key': process.env.REACT_APP_APIKEY
        }

        let exchange = await fetch('https://rest.coinapi.io/v1/exchanges/'+exchangeId, {headers: headers})
            .then(res => res.json())
            .catch(err => console.error(err));

        if(exchange.length>0) exchange = exchange[0];

        let symbols = await fetch('https://rest.coinapi.io/v1/symbols/'+exchangeId, {headers: headers})
            .then(res => res.json())
            .catch(err => console.error(err));

        let assets = {};

        if(!symbols.error){
            symbols.forEach(symbol => {
                if(assets[symbol.asset_id_base]){
                    assets[symbol.asset_id_base][symbol.asset_id_quote] = symbol;
                }
                else{
                    assets[symbol.asset_id_base] = {};
                    assets[symbol.asset_id_base][symbol.asset_id_quote] = symbol;
                }
            });
        }

        this.setState({
            exchangeId: exchangeId,
            exchange: exchange,
            symbols: symbols,
            assets: assets,
            loader: false
        });
    }

    navigate(){
        this.props.history.push({
            pathname: '/'
        });
    }

    async fetchSnapshot(){
        this.setState({
            loader2: true
        });

        let headers = {
            'Content-Type': 'application/json',
            'X-CoinAPI-Key': process.env.REACT_APP_APIKEY
        }

        let limit = this.state.limit;
        let startDate = this.state.startTime;
        let endDate = this.state.endTime;
        let symbolId = this.state.assets[this.state.base][this.state.quote].symbol_id;

        let snap = await fetch(`https://rest.coinapi.io/v1/trades/${symbolId}/history?time_start=${startDate}&time_end=${endDate}&limit=${limit}`, {headers: headers})
            .then(res => res.json())
            .catch(err => console.error(err));

        let data = [];

        if(!snap.error){
            if(snap.length===0){
                this.setState({
                    graphNote: "No data available for this query.",
                    loader2: false
                });
                return;
            }

            snap.forEach(trade => {
                let date = new Date(trade.time_exchange.split(".")[0]);

                if(data.length>0){
                    let lastDateObj = data[data.length-1];

                    if(lastDateObj.time===date){
                        if(trade.taker_side==="BUY" || trade.taker_side==="BUY_ESTIMATED"){
                            lastDateObj.buy+=trade.size;
                        }
                        else if(trade.taker_side==="SELL" || trade.taker_side==="SELL_ESTIMATED"){
                            lastDateObj.sell+=trade.size;
                        }
                        return;
                    }
                }
                let obj = {
                    time: date,
                    buy: 0,
                    sell: 0,
                    timeString: date.toISOString().split("T")[0] + "(" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ")"
                }

                if(trade.taker_side==="BUY" || trade.taker_side==="BUY_ESTIMATED"){
                    obj.buy=trade.size;
                }
                else if(trade.taker_side==="SELL" || trade.taker_side==="SELL_ESTIMATED"){
                    obj.sell=trade.size;
                }

                data.push(obj);
            });
        }

        this.setState({
            graphData: data,
            graphNote: "Number of trades within this period: "+snap.length,
            loader2: false
        });
    }

    resetDates(){
        let date = new Date();

        let endDate = new Date(date.setMinutes(date.getMinutes()-date.getTimezoneOffset()));
        endDate = endDate.toISOString().slice(0, -5);

        let startDate = new Date(date.setSeconds(date.getSeconds()-10));
        startDate = startDate.toISOString().slice(0, -5);

        this.setState({
            startTime: startDate,
            endTime: endDate
        });
    }

    selectBase(e){
        if(e!==this.state.base){
            this.setState({
                base: e,
                quote: ""
            });
        }
    }

    selectQuote(e){
        this.setState({
            quote: e
        });
    }

    selectStart(e){
        this.setState({
            startTime: e.target.value
        });
    }

    selectEnd(e){
        this.setState({
            endTime: e.target.value
        });
    }

    setLimit(e){
        this.setState({
            limit: e
        });
    }

    toggleExpand(){
        this.setState({
            expand: !this.state.expand
        });
    }

    render(){
        let assets = Object.keys(this.state.assets).sort();

        let quotes = [];
        if(this.state.base.length>0){
            quotes = (Object.keys(this.state.assets[this.state.base])).sort();
        }

        let isFetchDisabled = (new Date(this.state.startTime)>new Date(this.state.endTime)) ||
            (new Date(this.state.startTime)>new Date()) ||
            this.state.base.length===0 || this.state.quote.length===0;

        return (
            <div>
                {this.state.loader ?
                    <Grid container direction={"row"} justify={"center"} alignItems={"center"}>
                        <Grid item>
                            <CircularProgress/>
                        </Grid>
                    </Grid>
                    :
                    <Container className={"cardDiv"} >
                        <div className={"exchangeHeader"}>
                            <Button className={"exchangeHeaderIcon"} variant={"outlined"} onClick={() => this.navigate()}><ArrowBackIcon fontSize={"large"}/></Button>
                            <span>{this.state.exchange.name} Trading</span>
                        </div>
                        <Grid container>
                            <Grid item md={3}>
                                <Grid container spacing={2}>
                                    <Grid item>
                                        <Autocomplete
                                            id="baseValue"
                                            options={assets}
                                            getOptionLabel={(option) => option}
                                            onChange={(e, val) => this.selectBase(val)}
                                            style={{ width: 300 }}
                                            renderInput={(params) => <TextField {...params} label="Choose Base" variant="outlined" />}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <Autocomplete
                                            id="quoteValue"
                                            options={quotes}
                                            getOptionLabel={(option) => option}
                                            onChange={(e, val) => this.selectQuote(val)}
                                            style={{ width: 300 }}
                                            renderInput={(params) => <TextField {...params} label="Choose Quote" variant="outlined" />}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <TextField
                                            id="startTime"
                                            label="Start Time"
                                            type="datetime-local"
                                            variant={"outlined"}
                                            value={this.state.startTime}
                                            onChange={(e) => this.selectStart(e)}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <TextField
                                            id="endTime"
                                            label="End Time"
                                            type="datetime-local"
                                            variant={"outlined"}
                                            value={this.state.endTime}
                                            onChange={(e) => this.selectEnd(e)}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography id="discrete-slider" gutterBottom>
                                            Limit Results
                                        </Typography>
                                        <Slider
                                            defaultValue={100}
                                            aria-labelledby="discrete-slider"
                                            valueLabelDisplay="auto"
                                            step={100}
                                            marks
                                            min={100}
                                            max={2000}
                                            onChangeCommitted={(e, val) => this.setLimit(val)}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <Button variant={"outlined"} onClick={this.resetDates}>Reset Dates</Button>
                                    </Grid>
                                    <Grid item>
                                        <Button disabled={isFetchDisabled} variant={"outlined"} onClick={this.fetchSnapshot}>{this.state.loader2 ? <CircularProgress/> : "Fetch"}</Button>
                                    </Grid>
                                    <Grid item>
                                        <p style={{color: "red"}}>{this.state.graphNote}</p>
                                        <p><i>The values of Buy and Sell on the graph refers to the unit of the Base that is chosen. The graph shows the amount of units of the chosen Base that was bought or sold within a particular second.</i></p>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item md={9}>
                                <LineChart width={730} height={500} data={this.state.graphData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="timeString" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="buy" stroke="#8884d8" />
                                    <Line type="monotone" dataKey="sell" stroke="#82ca9d" />
                                </LineChart>
                            </Grid>
                        </Grid>
                    </Container>
                }
            </div>
        );
    }
}

export default withRouter(ExchangePage);