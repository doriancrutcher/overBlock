import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col, Card, Button } from 'react-bootstrap'

const EnterInfo = props => {
    
 const  [buttonStat,changeButtonStat]=useState(false)

    const battleRef = useRef(null)
    const twitchRef= useRef(null)

    const checkBattleTagAndTwitchHandle = async (battleTagName,twitchHandle=undefined) => {

        const splitName=battleTagName.split('');
        splitName[splitName.indexOf('#')]='-'

        changeButtonStat(true)
        
        const data = await fetch(`https://ovrstat.com/stats/pc/${splitName.join('')}`)
          
            .then(
                res => {
                    if (res.ok) {
                        console.log('valid battletag')
                        
                        return res.json()
                    }
                    else {changeButtonStat(false)
                        return alert('bad battletag')
                        
                    }
                }
            )
            .then(
                res => {
                    if (res === undefined) {
                        return null
                    } else {
                        sendBattleTag(splitName.join(''))
                    }
                }
            )

            if(twitchHandle!==undefined){
               await window.contract.setTwitch({TwitchHandle: twitchHandle})

            }else{
                console.log('no twitch handle provided')
            }

    }

    const sendBattleTag = async (battletag) => {
        await window.contract.addBattleTag({ name:window.accountId, battleTag: battletag })
        console.log(battletag)
        alert('refresh page')

    }
    //dorgon108-1679
    return (
        <Container style={{ marginTop: '20px' }}>
            <Card>
                <Card.Header as="h5">Welcome to BlockWatch! </Card.Header>
                <Card.Body>
                    <Card.Title>Please enter your battle tag here (PC example blockheads100#1234)</Card.Title>
                    <Card.Text>
                        <input style={{color:'white'}} ref={battleRef} placeholder='enter your battle tag'></input>
                    </Card.Text>

                    <Card.Title>Enter your twitch handle (optional) </Card.Title>
                    <Card.Text>
                        <input style={{color:'white'}} ref={twitchRef} placeholder='enter your battle tag'></input>
                    </Card.Text>

                    <Button disabled={buttonStat} onClick={() => { (twitchRef.current.value!=='')?checkBattleTagAndTwitchHandle(battleRef.current.value,twitchRef.current.value):checkBattleTagAndTwitchHandle(battleRef.current.value) }} variant="primary">Save Info</Button>
                </Card.Body>
            </Card>
        </Container>
    );
};

EnterInfo.propTypes = {

};

export default EnterInfo;