import React, {Component} from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

class CryptoCard extends Component {
    constructor(props){
        super(props);

        this.state = {
            ...props
        }
    }

    componentDidMount() {
    }

    render(){
        let img = "";
        if (this.state.image){
            img = this.state.image.url;
        }
        return (
            <Card className={"card"}>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item md={8}>
                            <span className={"cardTitle"}>
                                {this.state.data.name}
                            </span>
                            <Typography variant="body2" color="textSecondary" component="p">
                                Symbols: {this.state.data.data_symbols_count}
                            </Typography>
                        </Grid>
                        <Grid item md={4}>
                            <CardMedia image={img} component={"img"}/>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        );
    }
}

export default CryptoCard;