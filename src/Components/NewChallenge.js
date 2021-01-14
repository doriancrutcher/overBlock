import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Form, FormControl, InputGroup, Container, Row } from 'react-bootstrap'
import date from 'date-and-time'
import { async } from 'regenerator-runtime';


// The goal of this page is to collect information for a new challenge 
// This includes the title of the challenge
// entrance fee 
// the type of challenge it is based off of the overwatch api 
// and the end condition for the challenge 

// tis component is to record each new challenge in the in the owners record 

// and to be added to the members list to then be either accepted or rejected.  

const NewChallenge = props => {

  const inputBattleTag = useRef(null);
  const inputTwitch = useRef(null);
  const overwatchHeroes = ['Ana', 'Ashe', 'Baptiste', 'Bastion', 'Brigitte', 'D.Va', 'Doomfist', 'Echo', 'Genji', 'Hanzo', 'Junkrat', 'Lucio', 'Mcree', 'Mei', 'Mercy', 'Moira', 'Orisa', 'Pharah', 'Reaper', 'Reinhardt', 'Roadhog', 'Sigma', 'Soilder76', 'Sombra', 'Symmetra', 'Torbjorn', 'Tracer', 'WindowMaker', 'Winston', 'WreckingBall', 'Zarya', 'Zentatta']


  const [publicOrPrivate, changeToPublicOrPrivate] = useState('Private')
  const [individualOrTeams, changeIndividualOrTeams] = useState('individual')
  const [heroSpecific, changeHeroSpecific] = useState('Any Hero')
  const [today, changeToday] = useState(true)
  const [dateValue, changeDateValue] = useState('')
  const [gameSetting, changeGameSetting] = useState('Kill')
  const [challengeTitle, changeChallengeTitle] = useState('')
  const [submitStatus, changeSubmitStatus] = useState(false)


 

  // ------------------------ DOM References -------------------------------// 
  const challengeRef = useRef(null)
  const heroRef = useRef(null)
  const pointRef = useRef(null)
  const entranceFeeRef = useRef(null)
  const challengeTitleRef = useRef(null)
  const participantRef = useRef(null)


  const currentHour = new Date().getHours()
  const dateObject = new Date()
  const currentDate = `${(dateObject.getMonth() + 1 < 10) ? "0" + (dateObject.getMonth() + 1) : dateObject.getMonth() + 1}/${(dateObject.getDate() < 10) ? "0" + dateObject.getDate() : dateObject.getDate()}/${dateObject.getFullYear()}`
  const availiableHours = []
  const allHours = []
  for (let i = currentHour; i < 24; i++) {
    if (i > 12) {
      let x = i - 12
      availiableHours.push(`${x}:00PM`)
    } else {
      availiableHours.push(`${i}:00AM`)
    }
  }

  for (let i = 0; i < 24; i++) {
    if (i > 12) {
      let x = i - 12
      allHours.push(`${x}:00PM`)
    } else {
      allHours.push(`${i}:00AM`)
    }
  }


  console.log(currentDate)


  console.log(availiableHours)



  // Function collection needed to send info to blockchain 

  // Function 1 challenge array creation and addition 
  // Here this function will collect and consolodate all the separate pieces of information from the form that was created 

  const createUniqueTitleName = async () => {
    let currentTitle = challengeTitleRef.current.value
    let currentChallengeListLength = await window.contract.getChallengeLength()
    console.log(currentTitle + currentChallengeListLength)
    console.log(`new title is ${currentTitle} and ${currentChallengeListLength}`)
    return currentTitle + '  [challenge ID#:' + currentChallengeListLength + ']'
  }

  const sendToBlockChain = async () => {

    changeSubmitStatus(true)
    console.log('sending to blockchain')
    let getParticipants = participantRef.current.value
    let makeParticipantArray = getParticipants.split(',')
    let removeSpaces = [];
    let titleName = await createUniqueTitleName()



  // this section ensures that all the information needed has been entered and will halt the progress of the rest of the function until the necessary information 
  // has been provided 
      if (challengeTitleRef.current.value === '') { changeSubmitStatus(false); return alert('Enter a Title you Jerk') }
  if (entranceFeeRef.current.value === '' || entranceFeeRef.current.value.match(/[a-zA-Z]/g) !== null) { changeSubmitStatus(false); return alert('Is anything ever truly free? Please enter some sort of entrance fee for this challenge') }
  if (pointRef.current.value === '' || pointRef.current.value.match(/[a-zA-Z]/g) !== null) { changeSubmitStatus(false); return alert('Sometimes things must end. Please enter the end condition') }


  // this removes spaces and checks if the account names entered are in the correct format 
  if (getParticipants !== '') {
    console.log('something is wrong')
    makeParticipantArray.forEach(x => {
      removeSpaces.push(x.match(/\S/g).join(''))
    })
    for (const x of removeSpaces) {
      if (x.match(/\.testnet/g) === null || x.match(/\.testnet/g)[0] !== '.testnet') {
        console.log('invalid username')
        return (alert('invalid participant username detected'))
      }
    }
  } else {
    return alert('I mean you must know someone to play with you')
  }

    console.log('this ran!')
    // collection area

    let challengeType = challengeRef.current.value
    let challengeEndCondition = pointRef.current.value
    let challengeEntranceFee = entranceFeeRef.current.value

    console.log(`Title ${titleName} type:${challengeType} end condition:${challengeEndCondition} the Entrance Fee:${challengeEntranceFee} `)
    console.log(`adding Challenge details to block chain title ${titleName} and the end condition is ${challengeEndCondition}`)
    await window.contract.addChallengeDetails({title: String(titleName), type: challengeType,endCondition: challengeEndCondition })
    await window.contract.recordChallengeEntranceFeeAmount({title:String(titleName),amount:Number(challengeEntranceFee)})
    await window.contract.addChallengeParticipants({title:titleName, participants:removeSpaces})
    await window.contract.addToChallengeList({title:titleName})

    for ( let i = 0; i<removeSpaces.length;i++){
      console.log(removeSpaces[i])
    await window.contract.addChallengeToParticipantsList({user:removeSpaces[i],title:titleName})
    }
 
    alert('challenge uploaded go check it out in the challenge manager')

}

  // if (challengeTitleRef.current.value === '') { changeSubmitStatus(false); return alert('Enter a Title you Jerk') }
  // if (entranceFeeRef.current.value === '' || entranceFeeRef.current.value.match(/[a-zA-Z]/g) !== null) { changeSubmitStatus(false); return alert('Is anything ever truly free? Please enter some sort of entrance fee for this challenge') }
  // if (pointRef.current.value === '' || pointRef.current.value.match(/[a-zA-Z]/g) !== null) { changeSubmitStatus(false); return alert('Sometimes things must end. Please enter the end condition') }

  // if (getParticipants !== '') {
  //   makeParticipantArray.forEach(x => {
  //     removeSpaces.push(x.match(/\S/g).join(''))
  //   })
  //   for (const x of removeSpaces) {
  //     if (x.match(/\.testnet/g) === null || x.match(/\.testnet/g)[0] !== '.testnet') {
  //       console.log('invalid username')
  //       return (alert('invalid participant username detected'))
  //     }
  //   }
  // } else {
  //   return 











  return (
    <Container>
      <Row style={{ color: 'white', marginTop: '10px' }} className='d-flex justify-content-center'><h1>Create Your Challenge</h1></Row>
      <Row style={{ marginTop: '10px' }} className='d-flex justify-content-center'>
        <Form style={{ boarderRadius: '10px', width: '80vw', padding: '10px', backgroundColor: 'rgb(50,50,50)', color: 'white' }}>
          <Form.Group controlId="exampleForm.ControlInput1">
            <Form.Label>Challenge Title</Form.Label>
            <Form.Control ref={challengeTitleRef} placeholder="Enter Challenge Title Here..." />
          </Form.Group>
          <Form.Group controlId="exampleForm.ControlSelect1">
            <Form.Label>Public Or Private?</Form.Label>
            <Form.Control onChange={() => { (publicOrPrivate === 'Public') ? changeToPublicOrPrivate('Private') : changeToPublicOrPrivate('Public') }} as="select">
              <option>Private</option>
              <option>Public</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="exampleForm.ControlSelect1">
            <Form.Label>Challenge Type</Form.Label>
            <Form.Control ref={challengeRef} onChange={() => changeGameSetting(challengeRef.current.value)} as="select">
              <option>Solo Kills</option>
              <option>Victories</option>
              <option>Medals</option>
              <option>eliminations</option>
            </Form.Control>
          </Form.Group>


          {(gameSetting === "Kill") ?
            <Form.Group>
              <Form.Label>Kills to Win</Form.Label>
              <Form.Control
                onChange={() => {
                  changeDateValue(pointRef.current.value)
                }}
                ref={pointRef}
                type="text"
                placeholder='Enter Value'>
              </Form.Control>
            </Form.Group>
            : (gameSetting === "Victories") ?
              <Form.Group>
                <Form.Label>Victories to Win</Form.Label>
                <Form.Control
                  onChange={() => {
                    changeDateValue(pointRef.current.value)
                  }}
                  ref={pointRef}
                  type="text"
                  placeholder='Enter Value'>
                </Form.Control>
              </Form.Group> : (gameSetting === "Medals") ?
                <Form.Group>
                  <Form.Label>Medals to Win</Form.Label>
                  <Form.Control
                    onChange={() => {
                      changeDateValue(pointRef.current.value)
                    }}
                    ref={pointRef}
                    type="text"
                    placeholder='Enter Value'>
                  </Form.Control>
                </Form.Group> : (gameSetting === "eliminations") ?
                  <Form.Group>
                    <Form.Label>Eliminations to Win</Form.Label>
                    <Form.Control
                      onChange={() => {
                        changeDateValue(pointRef.current.value)
                      }}
                      ref={pointRef}
                      type="text"
                      placeholder='Enter Value'>
                    </Form.Control>
                  </Form.Group> : null
          }


          <Form.Group>
            <Form.Label>What is the entrance fee for this challenge?</Form.Label>
            <InputGroup className="mb-2 mr-sm-2">
              <InputGroup.Prepend>
                <InputGroup.Text>NEAR</InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl ref={entranceFeeRef} id="entrance fee" placeholder="enter NEAR amount" />
            </InputGroup>
          </Form.Group>

          <Form.Group controlId="exampleForm.ControlSelect1">
            <Form.Label>Hero Specific or Not?</Form.Label>
            <Form.Control onChange={() => { (heroSpecific !== 'Any Hero') ? changeHeroSpecific('Any Hero') : changeHeroSpecific('Specific Hero') }} as="select">
              <option>Any Hero</option>
              <option>Specific Hero</option>
            </Form.Control>
          </Form.Group>

          {(heroSpecific === 'Specific Hero') ?
            <Form.Group>
              <Form.Label>Choose your Hero</Form.Label>
              <Form.Control onChange={() => { console.log(heroRef.current.value) }} ref={heroRef} as="select">
                {overwatchHeroes.map((x) => {
                  return (<option>{x}</option>)
                })}
              </Form.Control>
            </Form.Group> : null
          }
          {
            (publicOrPrivate === 'Private') ?
              <Form.Group controlId="exampleForm.ControlTextarea1">
                <Form.Label>Enter Player Near Account Names Separated by Commas (example: blockheads.testnet,underdog3000.testnet)</Form.Label>
                <Form.Control ref={participantRef} as="textarea" rows={3} />
              </Form.Group> : <Form.Group controlId="Challenge Start Date">
                <Form.Label>What day would you like your challenge to begin?</Form.Label>
                <Form.Control
                  onChange={() => {
                    changeDateValue(dateRef.current.value)
                  }}
                  ref={dateRef}
                  type="text"
                  placeholder='enter date dd/mm/yyyy ex 03/12/2020'>
                </Form.Control>
                <Form.Label>What time would you like your challenge to begin?</Form.Label>
                <Form.Control
                  as="select"
                  placeholder='enter time dd/mm/yyyy'>
                  {
                    (dateValue === currentDate) ? availiableHours.map((x) => { return (<option>{x}</option>) }) : allHours.map((x) => { return (<option>{x}</option>) })
                  }
                </Form.Control>
              </Form.Group>


          }
          <Container>
            <Row className="d-flex justify-content-center">
              <Button disabled={submitStatus} onClick={() => { sendToBlockChain() }}>Submit</Button>
            </Row>
          </Container>
        </Form>
      </Row>
    </Container>


  );
};


export default NewChallenge;