import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Container, Row, Col, Jumbotron, Table, ProgressBar } from 'react-bootstrap';
import Api from './Api'
import PlayerView from './PlayerView'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";

import { TwitchEmbed, TwitchChat, TwitchClip, TwitchPlayer } from 'react-twitch-embed';

const Stream = (streamer) => {
    console.log(streamer)
    return (
        <div>
            <TwitchPlayer
                channel={streamer}
                id={streamer}
                theme="dark"


            />


        </div>
    );
}

const TwitchViewHome = props => {

    const [participants, changeParticipants] = useState(['emongg', 'jake_ow'])
   
    const [channel,changeChannel]=useState(0)
    const [streamer, changeStreamer] = useState(participants[channel])
    const [gameParticipants,changeGameParticipants]=useState([])
    

    
    const streams=participants.map((x,index)=>{
        return(
            
            <TwitchPlayer
                channel={streamer}
                id={streamer}
                theme="dark"
            />
        )
    })





   
    useEffect(() => {
        const twitchStreamUpdate = async () => {
          let ownersList = await window.contract.getOwnersChallenges({ user: window.accountId })
          // list of challenges the user is participating in 
          let participatingInChallengeList = await window.contract.getChallengeParticpantList({ user: window.accountId })
          // combine list and make the result only contain unique values 
          let combinedList = Array.from(new Set([...ownersList, ...participatingInChallengeList]))
          let activeChallenges = combinedList.filter(async (x) => { return await window.contract.getChallengeStartStatus({ title: x }) })
          let listOfParticipants = activeChallenges.map(async (x) => { return (await window.contract.getParticipantList({ title: x })) })
          let resolvedListOfParticipants
    
          await Promise.all(listOfParticipants).then((values) => {
            resolvedListOfParticipants = values
          });
        
          activeChallenges
          let twitchStreamers=[]
          let allList=[]
          resolvedListOfParticipants.forEach((x)=>{
            allList=[...allList,...x]
          })
          
          let activeChallengeIndex=Math.floor(Math.random()*activeChallenges.length)
          console.log('ohohooh')
          console.log(resolvedListOfParticipants[activeChallengeIndex])
          
          
            for(let i=0;i<resolvedListOfParticipants[activeChallengeIndex].length;i++){ 
             let twitchGuyGal=await window.contract.getTwitchHandle({name: resolvedListOfParticipants[activeChallengeIndex][i]})
            if(twitchGuyGal!==''){
              twitchStreamers.push(twitchGuyGal)
            }
            }
            

          changeParticipants(twitchStreamers)



  
          let channel=Math.floor(Math.random()*resolvedListOfParticipants[activeChallengeIndex].length-1)
          console.log()
        //   changeChannel(channel)   
        let challengeDetails = await window.contract.getChallengeDetails({ title: activeChallenges[activeChallengeIndex] })
        let challengeType = challengeDetails[0]
        let currentScores = await resolvedListOfParticipants[activeChallengeIndex].map(async (x) => {
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
            console.log(resolvedCurrentScores)
            
            
        changeGameParticipants(resolvedListOfParticipants[activeChallengeIndex])
    
        }
        twitchStreamUpdate()
      },[])


      useEffect(()=>{
        let channel=participants.indexOf(participants[Math.floor(Math.random()*participants.length-1)])
        console.log()
        //changeChannel(channel) 
      },[participants])

    return (
            <Jumbotron fluid style={{ borderRadius: "10px", padding: '5px' }}>
                <Container>
                    <Row className="d-flex justify-content-center"><h1>Featured Match</h1></Row>
                    <Row className="d-flex justify-content-center">
                    <TwitchEmbed
        channel={participants[channel]}
        id={streamer}
        theme="dark"
        muted
        onVideoPause={() => console.log(':(')}
      /> 
                    </Row>
                    <Row style={{ marginTop: '10px' }} className="d-flex justify-content-center">


                        <Table striped bordered hover variant="dark">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Team Name</th>
                                    <th>Current Team Progress</th>
                                    <th>Twitch Stream</th>

                                </tr>
                            </thead>
                            <tbody>

                                {gameParticipants.map((x, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{index}</td>
                                            <td>{x}</td>

                                            <td className="align-middle" style={{ backgroundColor: 'black', textAlign: 'center' }}>
                                                <ProgressBar now={75}></ProgressBar>
                                            </td>

                                            <td style={{ textAlign: 'center', alignItems: 'center' }} >
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                                <Button onClick={()=>{console.log(streams);changeChannel(index)}}>Twitch Stream</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}



                            </tbody>
                        </Table>

                    </Row>
                    <Row className="d-flex justify-content-center">
                       <Button >Create A New Challenge</Button>
                    </Row>
                </Container>
            </Jumbotron>
    );
};

TwitchViewHome.propTypes = {

};

export default TwitchViewHome;