import 'regenerator-runtime/runtime'
import React, { useEffect, setState, useState } from 'react'
import { login, logout } from './utils'
import './global.css'
import './scss/AppStyles.scss'
import { Navbar, NavDropdown, Nav, Container, Row, Col } from 'react-bootstrap'
import MatchView from './Components/MatchView'
import TwitchViewHome from './Components/TwitchViewHome'
import CreateMatch from './Components/CreateMatch'
import NewChallenge from './Components/NewChallenge'
import EnterInfo from './Components/EnterInfo'
import MyChallenges from './Components/MyChallenges'
import TokenManager from './Components/TokenManager'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import * as nearApiJs from 'near-api-js'
import getConfig from './config'
import { async } from 'regenerator-runtime/runtime'
const { networkId, nodeUrl, walletUrl } = getConfig(process.env.NODE_ENV || 'development')
const {

  KeyPair,
  InMemorySigner,
  transactions: {
    addKey
  },
  utils: {
    PublicKey,
    format: {
      parseNearAmount, formatNearAmount
    }
  },
} = nearApiJs


const useContractFullAccessKey = async () => {
  console.log(process.env.CONTRACT_PRIV_KEY)
  // Step 1:  get the keypair from the contract's full access private key
  let keyPair = KeyPair.fromString(process.env.CONTRACT_PRIV_KEY)

  // Step 2:  load up an inMemorySigner using the keyPair for the account
  let signer = await InMemorySigner.fromKeyPair(networkId, process.env.CONTRACT_NAME, keyPair)

  // Step 3:  create a connection to the network using the signer's keystore and default config for testnet
  const near = await nearApiJs.connect({
    networkId, nodeUrl, walletUrl, deps: { keyStore: signer.keyStore },
  })

  // Step 4:  get the account object of the currentAccount.  At this point, we should have full control over the account.
  window.contaccount = new nearApiJs.Account(near.connection, 'dev-1610478176537-9279284')

}

useContractFullAccessKey()




export default function App() {
  const titleStyle = {
    color: 'rgb(237, 172, 87)'
  }


  const [containsBattleTag, changeContainsBattleTag] = useState('loading')
  const [watchTokenAmount, changeWatchTokenAmount] = useState(0)
  const [userChallenges, changeUserChallenge] = useState([])
  const [streamerName,changeStreamerName]=useState('emongg')

  const checkScore = async (title, playerArray) => {

  }

  

  useEffect(() => {
    const challengeUpdate = async () => {




      // list of owners's challenge challenges 
      let ownersList = await window.contract.getOwnersChallenges({ user: window.accountId })
      // list of challenges the user is participating in 
      let participatingInChallengeList = await window.contract.getChallengeParticpantList({ user: window.accountId })
      // combine list and make the result only contain unique values 
      let combinedList = Array.from(new Set([...ownersList, ...participatingInChallengeList]))
      // list of active challenges 
      let activeChallenges = combinedList.filter(async (x) => { return await window.contract.getChallengeStartStatus({ title: x }) })
      // list of participants in active challenges
      let listOfParticipants = activeChallenges.map(async (x) => { return (await window.contract.getParticipantList({ title: x })) })

      let resolvedListOfParticipants

      await Promise.all(listOfParticipants).then((values) => {
        resolvedListOfParticipants = values
      });


      // [title]----> [player 1, player 2 ]
      let listOfConcludedChallenges = combinedList.map(async (x, index) => {
        // get challenge type 
        let challengeDetails = await window.contract.getChallengeDetails({ title: x })
        let challengeType = challengeDetails[0]
        // get list of players for this challenge
        let playerList = resolvedListOfParticipants[index]
        // get list of current scores from this player list


        let currentScores = await playerList.map(async (x) => {
          // create an array of current scores 
          let currentScoresList
          // get battletag for this player
          let battleTag = await window.contract.getBattleTag({ name: x })
          await fetch(`https://ovrstat.com/stats/pc/${battleTag}`)
            .then(res => { if (res.status !== 200) { alert('something is wrong with the battle tag' + battleTag) }; return res.json() })
            .then(res => {
              currentScoresList = res.quickPlayStats.careerStats.allHeroes.combat[challengeType]
            }
            )
          return currentScoresList

        })
        let resolvedCurrentScores
        await Promise.all(currentScores).then(value => resolvedCurrentScores = value)


        // get list of final scores 
        let finalScores = await window.contract.getArrayOfFinalScores({ title: x })
        // compare final scores to current scores and make true or false array from this 

        let resultsArray = finalScores.map((x, Findex) => {
          return x <= resolvedCurrentScores[Findex]
        })
        if (resultsArray.includes(true)) {
          let winnerNames = resolvedListOfParticipants[index].filter((x, Rindex) => resultsArray[Rindex])
          let prize = await window.contract.getEntranceFeeAmount({ title: x })
          let distributedPrize = prize / winnerNames.length
          winnerNames.forEach(async (x) => {
            window.contaccount.sendMoney(x, distributedPrize)
          })

          await window.contract.endChallengeStartStatus({ title: x })
          await window.contract.addToWinners({ title: x, users: winnerNames })

        }


      })
      // [ player 1] ----> (requiredEndScore>CurrentScore)-----> returns (true or false)
      // returns array [true,false]
      // if array includes true conclude competition

      // comparison for challenge winners 


    }
    challengeUpdate()
  }, [])

  useEffect(() => {
    const checkBlockChain = async () => {
      let battleTagStatus = await window.contract.checkBattleTag({ name: window.accountId })
      console.log(battleTagStatus)

      if (battleTagStatus) {
        changeContainsBattleTag('showApp')
      }
      else {
        changeContainsBattleTag('enterInfo')
      }

    }
    checkBlockChain();
  }, [])



  return (
    <Router>
      <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Navbar.Brand href="/">Block<span style={titleStyle}>WATCH</span></Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
          </Nav>
          <Nav>

            <Nav.Item style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}><Link to='/newChallenge'>Create New Challenge</Link>
            </Nav.Item>
            <Nav.Item style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}><Link to='/challengeinventory'>Challenge Manager</Link>
            </Nav.Item>

            <Nav.Link onClick={(window.accountId === '') ? login : logout}>
              {(window.accountId === '') ? 'login' : window.accountId}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>



      {
        (containsBattleTag === 'loading') ? <p style={{ color: 'white' }}>Loading</p> :
          (containsBattleTag === 'enterInfo') ? <EnterInfo /> : (
            <Switch>
              <Route exact path="/">
                <Container>
                  <Col>
                    <TwitchViewHome streamer={streamerName}/>
                  </Col>
                  <Col>
                    <MatchView />
                  </Col>


                </Container>
              </Route>

              <Route exact path="/creatematch">
                <CreateMatch />
              </Route>
              <Route exact path="/newChallenge">
                <NewChallenge />
              </Route>
              <Route exact path='/challengeinventory'>
                <MyChallenges />
              </Route>
              <Route exact path='/tokenmanager'>
                <TokenManager></TokenManager>
              </Route>

            </Switch>)
      }
    </Router>)

}