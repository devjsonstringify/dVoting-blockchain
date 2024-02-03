// Node modules
import Plotly from 'plotly.js-dist-min';
import React, { Component } from "react";
import { Link } from "react-router-dom";

// Components
import winnerImage from "../../images/winner.jpg";
import Navbar from "../Navbar/Navigation";
import NavbarAdmin from "../Navbar/NavigationAdmin";
import NotInit from "../NotInit";
// Contract
import Election from "../../contracts/Election.json";
import getWeb3 from "../../getWeb3";

// CSS
import { gridContainerStyle, gridItemStyle, winnerImageBg } from '../SharedStyling/style';
import "./Results.css";

export default class Result extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      account: null,
      web3: null,
      isAdmin: false,
      candidateCount: undefined,
      candidates: [],
      votersDetails: [],
      isElStarted: false,
      isElEnded: false,
    };
  }
  componentDidMount = async () => {
    // refreshing once
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
      this.setState({ web3, ElectionInstance: instance, account: accounts[0] });

      // Get total number of candidates
      const candidateCount = await this.state.ElectionInstance.methods
        .getTotalCandidate()
        .call();
      this.setState({ candidateCount: candidateCount });
      
      const totalVoters = await this.state.ElectionInstance.methods.getTotalVoter().call();
      for (let i = 0; i < totalVoters; i++) {
          const voterDetail = await this.state.ElectionInstance.methods.getVoterDetails(i).call();
          this.state.votersDetails.push({voterDetail});
      }
      
      // Get start and end values
      const start = await this.state.ElectionInstance.methods.getStart().call();
      this.setState({ isElStarted: start });
      const end = await this.state.ElectionInstance.methods.getEnd().call();
      this.setState({ isElEnded: end });

      // Loadin Candidates detials
      for (let i = 1; i <= this.state.candidateCount; i++) {
        const candidate = await this.state.ElectionInstance.methods
          .candidateDetails(i - 1)
          .call();
        this.state.candidates.push({
          id: candidate.candidateId,
          header: candidate.header,
          slogan: candidate.slogan,
          party: candidate.party,
          voteCount: candidate.voteCount,
        });
      }

      // Extract candidate data for data visualization
      let pieDataByCandidate = [{
        values: [],
        labels: [],
        type: 'pie'
      }];

      let layout = {
        height: 400,
        width: 615,
      };

      const config = { responsive: true }
      
      if (this.state.candidates.length > 0){
        const pieDataByCandidateLabels= this.state.candidates.map((({ header }) =>   header))
        const pieDataByCandidateValues = this.state.candidates.map((({ voteCount }) => voteCount))
        
        pieDataByCandidate.forEach((data) => {
          data.values = [...data.values, ...pieDataByCandidateValues];
          data.labels = [...data.labels, ...pieDataByCandidateLabels];
        });

        const pieDataByPartyValues = this.state.candidates.map((({ voteCount }) =>   voteCount))
        const pieDataByPartyLabels = this.state.candidates.map((({ party }) => party))
        
        const xValue = pieDataByPartyLabels 
        const yValue = pieDataByPartyValues

        const traceBarChartByParty = {
          x: xValue,
          y: yValue,
          type: 'bar',
          text: yValue.map(String),
          textposition: 'auto',
          marker: {
          color: 'rgb(158,202,225)',
          opacity: 0.6,
          line: {
            color: 'rgb(8,48,107)',
            width: 1.5
          }
        }
        };

      const dataBarChartByParty = [traceBarChartByParty];

      let barChartByTotalVotes = [
        {
        x: pieDataByCandidateLabels,
        y: pieDataByCandidateValues,
        text: yValue.map(String),
        color: 'rgb(158,202,225)',
        opacity: 0.6,
        line: {
            color: 'rgb(8,48,107)',
            width: 1.5
          },
        type: 'bar'
        }
        ];
        
       const voterDetail = this.state.votersDetails.map(item => {
        return item.voterDetail
       });
        
      const voterAge = voterDetail.map(({ age }) => age)
      const voterGender = voterDetail.map(({ gender }) => gender)
      
    let trace1 = {
      x: voterGender,
      y: voterAge,
      name: 'SF Zoo',
      type: 'bar'
    };
    
     let barChartByGenderAndAge = [trace1];
      Plotly.newPlot('pieChartByCandidate', pieDataByCandidate, {...layout, title: 'Percentage Breakdown of Total Votes'}, config);
      Plotly.newPlot('barChartByParty', dataBarChartByParty, {...layout, title: 'Percentage Breakdown by party', barmode: 'stack'},  config);
      Plotly.newPlot('barChartByTotalVotes', barChartByTotalVotes, {...layout, title: 'Total votes'},  config);
      Plotly.newPlot('barChartByTotalGender', barChartByGenderAndAge, {...layout, title: 'Total votes by voters gender'},  config);
      }

      // Admin account and verification
      const admin = await this.state.ElectionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
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
        <div>
          {!this.state.isElStarted && !this.state.isElEnded ? (
            <NotInit />
          ) : this.state.isElStarted && !this.state.isElEnded ? (
            <div className="container-item attention">
              <center>
                <h3>The election is being conducted at the movement.</h3>
                <p>Result will be displayed once the election has ended.</p>
                <p>Go ahead and cast your vote {"(if not already)"}.</p>
                <br />
                <Link
                  to="/Voting"
                  style={{ color: "black", textDecoration: "underline" }}
                >
                  Voting Page
                </Link>
              </center>
            </div>
          ) : !this.state.isElStarted && this.state.isElEnded ? (
            displayResults(this.state.candidates)
          ) : null}
        </div>
      </>
    );
  }
}

function displayWinner(candidates) {
  const getWinner = (candidates) => {
    // Returns an object having maxium vote count
    let maxVoteRecived = 0;
    let winnerCandidate = [];
    for (let i = 0; i < candidates.length; i++) {
      if (candidates[i].voteCount > maxVoteRecived) {
        maxVoteRecived = candidates[i].voteCount;
        winnerCandidate = [candidates[i]];
      } else if (candidates[i].voteCount === maxVoteRecived) {
        winnerCandidate.push(candidates[i]);
      }
    }
    return winnerCandidate;
  };
  const renderWinner = (winner) => {
    return (
        <article>
          <h1>Winner</h1>
          <h2>{winner.header}</h2>
          <p>{winner.slogan}</p>
          <h5>Total Votes:{winner.voteCount}</h5>
        </article>
    );
  };
  const winnerCandidate = getWinner(candidates);
  return <>{winnerCandidate.map(renderWinner)}</>;
}

export function displayResults(candidates) {
  return (
    <>
      {candidates.length > 0 ? (
          <div style={{...gridContainerStyle, gridTemplateRows: 'repeat(1, 1fr)', height: 'auto', textAlign: 'center', margin: '0 0 1rem 0', border: 'none',  padding: 0, gap: 0, borderRadius: 0 }}>
              <div style={{ ...gridItemStyle, border: 'none', borderRadius: 0}}><img style={{...winnerImageBg}} src={winnerImage} alt="winnerImage" /></div>
              <div style={{ ...gridItemStyle, backgroundColor: '#000', color: '#ffff', border: 'none', borderRadius: 0 }}>{displayWinner(candidates)}</div>
          </div>
      ) : null}
      <h2 style={{ textAlign: "center"}}>Data visualization of the results</h2>
      <div style={gridContainerStyle}>
        <div style={{...gridItemStyle}}>
          <div id="pieChartByCandidate"></div>
      </div>
      <div style={{...gridItemStyle}}>
          <div id="barChartByParty"></div>
        </div>
      <div style={{...gridItemStyle}}>
          <div id="barChartByTotalVotes"></div>
      </div>
      <div style={{...gridItemStyle}}>
          <div id="barChartByTotalGender"></div>
      </div>
    </div>
    </>
  );
}
