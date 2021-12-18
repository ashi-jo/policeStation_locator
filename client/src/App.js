import React, { Fragment } from "react";
import { Link, Route, Switch, BrowserRouter as Router } from "react-router-dom";
import Test from "./components/Test/Test.js";
import "./App.css";

function App() {
  return (
    <Fragment>
      <Test />
    </Fragment>
  );
}

export default App;
