// Node modules
import React, { Component } from "react";

// Components
import Navbar from "../Navbar/Navigation";
import NavbarAdmin from "../Navbar/NavigationAdmin";
import NotInit from "../NotInit";

// CSS
import { formButton, formHeader, formInnerContainer, formInput, formInputWrapper, formRegistration, heroRegistration } from "../SharedStyling/style";
import "./Registration.css";

// Contract
import Election from "../../contracts/Election.json";
import getWeb3 from "../../getWeb3";

export default class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      web3: null,
      account: null,
      isAdmin: false,
      isElStarted: false,
      isElEnded: false,
      voterCount: undefined,
      voterName: "",
      voterPhone: "",
      voterAge: null,
      voterGender: "", 
      voters: [],
      currentVoter: {
        address: undefined,
        name: null,
        phone: null,
        age: null,
        gender: null,
        hasVoted: false,
        isVerified: false,
        isRegistered: false,
      },
    };
  }

  // refreshing once
  componentDidMount = async () => {
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
      window.location.reload();
    }
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Election.networks[networkId];
      const instance = new web3.eth.Contract(
        Election.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({
        web3: web3,
        ElectionInstance: instance,
        account: accounts[0],
      });

      // Admin account and verification
      const admin = await this.state.ElectionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }

      // Get start and end values
      const start = await this.state.ElectionInstance.methods.getStart().call();
      this.setState({ isElStarted: start });
      const end = await this.state.ElectionInstance.methods.getEnd().call();
      this.setState({ isElEnded: end });

      // Total number of voters
      const voterCount = await this.state.ElectionInstance.methods
        .getTotalVoter()
        .call();
      this.setState({ voterCount: voterCount });

      // Loading all the voters
      for (let i = 0; i < this.state.voterCount; i++) {
        const voterAddress = await this.state.ElectionInstance.methods
          .voters(i)
          .call();
        const voter = await this.state.ElectionInstance.methods
          .voterDetails(voterAddress)
          .call();
        this.state.voters.push({
          address: voter.voterAddress,
          name: voter.name,
          phone: voter.phone,
          age: voter.age,
          gender: voter.gender,
          hasVoted: voter.hasVoted,
          isVerified: voter.isVerified,
          isRegistered: voter.isRegistered,
        });
      }
      this.setState({ voters: this.state.voters });

      // Loading current voters
      const voter = await this.state.ElectionInstance.methods
        .voterDetails(this.state.account)
        .call();
      this.setState({
        currentVoter: {
          address: voter.voterAddress,
          name: voter.name,
          phone: voter.phone,
          age: voter.voterAge,
          gender: voter.gender,
          hasVoted: voter.hasVoted,
          isVerified: voter.isVerified,
          isRegistered: voter.isRegistered,
        },
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error(error);
      alert(
        `Failed to load web3, accounts, or contract. Check console for details (f12).`
      );
    }
  };
  updateVoterName = (event) => {
    this.setState({ voterName: event.target.value });
  };
  updateVoterPhone = (event) => {
    this.setState({ voterPhone: event.target.value });
  };
  updateVoterAge = (event) => {
    this.setState({ voterAge: event.target.value });
  };
  updateVoterGender = (event) => {
    this.setState({ voterGender: event.target.value });
  };
  registerAsVoter = async () => {
    await this.state.ElectionInstance.methods
    .registerAsVoter(this.state.voterName, this.state.voterPhone, this.state.voterAge, this.state.voterGender)
    .send({ from: this.state.account, gas: 1000000 });
    window.location.reload();
  };
  render() {
    if (!this.state.web3) {
      return (
        <>
          {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
          <center>Loading Web3, accounts, and contract...</center>
        </>
      );
    }
    return (
      <>
        {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
        {!this.state.isElStarted && !this.state.isElEnded ? (
          <NotInit />
        ) : (
            <>
              <div style={{...heroRegistration}}/>
              <div style={{ ...formRegistration }}>
                <div style={{...formInnerContainer}}>
                    <h3 style={{...formHeader}}>Voter registration</h3>
              <div>
                <form>
                  <div style={{...formInputWrapper}}>
                        <label>Account Address</label>
                        <input
                           style={{...formInput}}
                        type="text"
                        value={this.state.account}
                      />
                  </div>
                  <div style={{...formInputWrapper}}>
                        <label>Name</label>
                        <input
                           style={{...formInput}}
                        type="text"
                        placeholder="eg. Ava"
                        value={this.state.voterName}
                        onChange={this.updateVoterName}
                      />
                  </div>
                  <div style={{...formInputWrapper}}>
                    <label>Phone number <span style={{ color: "tomato" }}>*</span></label>
                    <input
                         style={{...formInput}}
                        type="number"
                        placeholder="eg. 9841234567"
                        value={this.state.voterPhone}
                        onChange={this.updateVoterPhone}
                      />
                      </div>
                      <div style={{...formInputWrapper}}>
                    <label>Age  <span style={{ color: "tomato" }}>*</span></label>
                        <input
                          style={{...formInput}}
                        type="number"
                        placeholder="eg. 18"
                          min="18"
                          max="150" 
                        value={this.state.voterAge}
                        onChange={this.updateVoterAge}
                      />
                      </div>
                    <div style={{...formInputWrapper}}>
                        <label>Gender <span style={{ color: "tomato" }}>*</span></label>
                        <select
                          style={{...formInput}}
                          value={this.state.voterGender}
                          onChange={this.updateVoterGender}
                        >
                          <option value="" disabled>Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                    </div>
                  <p>
                    <span style={{ color: "tomato" }}> Note: </span>
                    <br /> Make sure your account address and Phone number are
                    correct. <br /> Admin might not approve your account if the
                    provided Phone number nub does not matches the account
                    address registered in admins catalogue.
                      </p>
                      <button
                        style={{...formButton}}
                    disabled={
                      this.state.voterPhone.length !== 10 ||
                      this.state.currentVoter.isVerified
                    }
                    onClick={this.registerAsVoter}
                  >
                    {this.state.currentVoter.isRegistered
                      ? "Update"
                      : "Register"}
                        </button>
                </form>
              </div>
              </div>
              </div>
            {this.state.isAdmin ? (
              <div
                className="container-main"
                style={{ borderTop: "1px solid" }}
              >
                <small>TotalVoters: {this.state.voters.length}</small>
                {loadAllVoters(this.state.voters)}
              </div>
            ) : null}
          </>
        )}
      </>
    );
  }
}
export function loadCurrentVoter(voter, isRegistered) {
  return (
    <>
      <div
        className={"container-item " + (isRegistered ? "success" : "attention")}
      >
        <center>Your Registered Info</center>
      </div>
      <div
        className={"container-list " + (isRegistered ? "success" : "attention")}
      >
        <table>
          <tr>
            <th>Account Address</th>
            <td>{voter.address}</td>
          </tr>
          <tr>
            <th>Name</th>
            <td>{voter.name}</td>
          </tr>
          <tr>
            <th>Phone</th>
            <td>{voter.phone}</td>
          </tr>
          <tr>
            <th>Age</th>
            <td>{voter.age}</td>
          </tr>
          <tr>
            <th>Gender</th>
            <td>{voter.gender}</td>
          </tr>
          <tr>
            <th>Voted</th>
            <td>{voter.hasVoted ? "True" : "False"}</td>
          </tr>
          <tr>
            <th>Verification</th>
            <td>{voter.isVerified ? "True" : "False"}</td>
          </tr>
          <tr>
            <th>Registered</th>
            <td>{voter.isRegistered ? "True" : "False"}</td>
          </tr>
        </table>
      </div>
    </>
  );
}
export function loadAllVoters(voters) {
  const renderAllVoters = (voter) => {
    return (
      <>
        <div className="container-list success">
          <table>
            <tr>
              <th>Account address</th>
              <td>{voter.address}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{voter.name}</td>
            </tr>
            <tr>
              <th>Phone</th>
              <td>{voter.phone}</td>
            </tr>
            <tr>
              <th>Voted</th>
              <td>{voter.hasVoted ? "True" : "False"}</td>
            </tr>
            <tr>
              <th>Verified</th>
              <td>{voter.isVerified ? "True" : "False"}</td>
            </tr>
            <tr>
              <th>Registered</th>
              <td>{voter.isRegistered ? "True" : "False"}</td>
            </tr>
          </table>
        </div>
      </>
    );
  };
  return (
    <>
      <div className="container-item success">
        <center>List of voters</center>
      </div>
      {voters.map(renderAllVoters)}
    </>
  );
}
