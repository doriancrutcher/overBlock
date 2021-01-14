import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Card,Button,Container,Row,Col,Table} from 'react-bootstrap'

const TokenManager = props => {
    const [currentTokenAmount, changeTokenAmount] = useState(0);
    const [challengeNameList,changeChallengeNameList]=useState([])
    const [winnersList,changeWinnersList]=useState([])
    const [entranceFeeList,changeEntranceFeeList]=useState([])
    
    const inputRef=useRef(null)

    useEffect(() => {
        const getTokens = async () => {
            let tokenAmount = await window.contract.retreiveTokenAmount({
                user: window.accountId
            })
            changeTokenAmount(tokenAmount)
        }
        
        getTokens();
    }, [])

    useEffect(()=>{

         const getDetails = async () => {
            let challengeNames = await window.contract.getChallengerChallenges({ challenger: window.accountId })
            let challengeDetailsStore = [];
            let statusList = []
            let pOrPList = [];
            let entranceFees = []
            let acceptedChallengesList = []
            let challengeWinners=[];

            for (const x of challengeNames) {
                let getchallengeWinners=await window.contract.getChallengeWinnerName({challengeTitle:x})
                let details = await window.contract.getChallengeDetails({ title: x })
                let participantList = await window.contract.getParticipantList({ title: x })
                let statusListFromChain = await window.contract.getParticipantStatus({ title: x });
                let userIndex = participantList.indexOf(window.accountId)
                let acceptedChallengeStatus = await window.contract.checkAcceptedChallenges({ name: window.accountId, title: x })

                challengeWinners.push(getchallengeWinners)
                challengeDetailsStore.push(details[3])
                pOrPList.push(details[4])
                entranceFees.push(details[2])
                statusList.push(statusListFromChain[userIndex])
                acceptedChallengesList.push(acceptedChallengeStatus)

                console.log(details)





            }
            changeWinnersList(challengeWinners)
            changeChallengeNameList(challengeNames)
            changeEntranceFeeList(entranceFees)
        }
        getDetails()
    },[])


    const addMoreMonies=()=>{


         sinputRef.current.value
    }

    return (
      <Container>
          <Row className="justify-content-center d-flex">
            <Card style={{ marginTop:'10px', width: '18rem' }}>
                <Card.Body>
                    <Card.Title>User's Tokens</Card.Title>
                    <Card.Text>
                                {currentTokenAmount}
                    </Card.Text>
                    <input ref={inputRef} placeholder='enter token amount'></input><Button onClick={addMoreMonies} >Submit</Button>
              
                </Card.Body>
            </Card>
            </Row>

            <Row>
            <Table style={{marginTop:'10px'}} striped bordered hover variant="dark">
  <thead>
    <tr>
      <th>#</th>
      <th>Challenge Name</th>
      <th>Entrance Fee</th>
      <th>Winners</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
        {challengeNameList.map((x,index)=>{return(
                <tr>
                <td>{index}</td>
                <td>{x}</td>
                <td>{entranceFeeList[index]}</td>
                <td>{winnersList[index]}</td>
                <td>{(winnersList[index])?<Button>Send Prize</Button>:'N/A'}</td>
              </tr>)
        })}


  </tbody>
</Table>
            </Row>

            </Container>
        
    );
};

TokenManager.propTypes = {

};

export default TokenManager;