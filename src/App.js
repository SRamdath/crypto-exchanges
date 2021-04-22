import './App.css';
import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import Grid from "@material-ui/core/Grid";

import ExchangesIndex from "./Components/ExchangesIndex";
import Container from "@material-ui/core/Container";
import ExchangePage from "./Components/ExchangePage";

function App() {
    console.log(process.env.PUBLIC_URL);
  return (
      <Router basename={process.env.PUBLIC_URL}> 
        <Grid container>
            <Container>
                <Switch>
                    <Route exact path="/">
                        <ExchangesIndex/>
                    </Route>
                </Switch>
                <Switch>
                    <Route exact path="/exchange/:name">
                        <ExchangePage/>
                    </Route>
                </Switch>
            </Container>
        </Grid>
      </Router>
  );
}

export default App;
