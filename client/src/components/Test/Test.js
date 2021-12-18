import React, { Component, Fragment } from "react";
const axios = require("axios");
export default class Test extends Component {
  constructor() {
    super();
    this.state = {
      developers: [],
    };
  }
  componentDidMount() {
    const getDevelopers = async () => {
      try {
        const res = await axios.get("/test");
        this.setState({ developers: res.data });
      } catch (err) {
        console.log(err);
      }
    };
    getDevelopers();
  }
  render() {
    return (
      <Fragment>
        <h1>Hello</h1>
        <div>
          {this.state.developers.map((d) => {
            return <p key={d.id}>{d.name}</p>;
          })}
        </div>
      </Fragment>
    );
  }
}
