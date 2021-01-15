import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Table, Container, Row, Col, Button } from 'react-bootstrap'

const MyChallenges = props => {

    // Participating Challengengs 
    const [challengeList, changeChallengeList] = useState([]);
    const [challengeDetails, changeChallengeDetails] = useState([]);
    const [getStatusList, changeStatusList] = useState([])
    const [privateOrPublicList, changePrivatOrPublicList] = useState([]);
    const [challengeFees, changeChallengeFees] = useState([]);
    const [acceptedChallenges, changeAcceptedChallenges] = useState([]);



    //Owners Challenges 

    const [ownersChallengeList, changeOwnersChallengeList] = useState([]);
    const [ownerChallengeStatus, changeOwnerChallengeStatus] = useState([]);
    const [getOwnerWinner, changeGetOwnerWinners] = useState([]);
    const [getOwnerChallengeEndConditions, changeOwnerEndConditions] = useState([])
    const [ownerType, changeOwnerType] = useState([])
    const [ownerPrize, changeOwnerPrize] = useState([])
    const [numberOfParticipants, changeNumberOfParticipants] = useState([]);


    useEffect(() => {
        const getChallengeList = async () => {
            let challengeNames = await window.contract.getChallengeParticpantList({user:window.accountId})

            changeChallengeList(challengeNames)

        }
        getChallengeList();

    }, [])



    useEffect(() => {
        const getDetails = async () => {
            let challengeNames = await window.contract.getChallengeParticpantList({user:window.accountId})
            let challengeDetailsStore = [];
            let statusList = []
            let pOrPList = [];
            let entranceFees = []
            let acceptedChallengesList = []

            for (const x of challengeNames) {
                let details = await window.contract.getChallengeDetails({ title: x })
                let participantList = await window.contract.getParticipantList({ title: x })
                let statusListFromChain = await window.contract.getChallengeStartStatus ({title:x});
                let userIndex = participantList.indexOf(window.accountId)
                let acceptedChallengeStatus = await window.contract.getAcceptedChallengesList({title:x})
                let entranceFeeChallenge=await window.contract.getEntranceFeeAmount({title:x})

                challengeDetailsStore.push(details[3])
                pOrPList.push(details[4])
                entranceFees.push(entranceFeeChallenge)
                statusList.push((statusListFromChain)?'Challenge has begun':'challenge has not started yet')
                acceptedChallengesList.push((acceptedChallengeStatus.includes(window.accountId))?true:false)






            }

            changeChallengeDetails(challengeDetailsStore)
            changePrivatOrPublicList(pOrPList)
            changeStatusList(statusList)
            changeChallengeFees(entranceFees)
            changeAcceptedChallenges(acceptedChallengesList)
        }
        getDetails()
    }, [])



    useEffect(() => {
        const getOwnerChallengeList = async () => {
            let ownerChallengeNames = await window.contract.getOwnersChallenges({user:window.accountId})
            let startStatusList=[];
            let ownerChallengeEndConditions=[];
            let challengePrizeTotalList=[];
            let challengeParticipantNumbers=[];
            let ownerType=[];
       
            changeOwnersChallengeList(ownerChallengeNames);

            for (const y of ownerChallengeNames) {
                let getOwnerChallengeDetails=await window.contract.getChallengeDetails({title:y})
                let startStatus=await window.contract.getChallengeStartStatus({title:y})
                let ownerChallengeEndCondition= getOwnerChallengeDetails[1]
                let challengePrizeTotal=await window.contract.getChallengeBal({title:y})
                let acceptedParticipantNumber=await window.contract.getAcceptedChallengesList({title:y})
                startStatusList.push(startStatus)
                ownerChallengeEndConditions.push(ownerChallengeEndCondition)
                challengePrizeTotalList.push(challengePrizeTotal)
                challengeParticipantNumbers.push(acceptedParticipantNumber.length)
                ownerType.push(getOwnerChallengeDetails[0])
      
            }            changeOwnerChallengeStatus(startStatusList)
            changeOwnerEndConditions(ownerChallengeEndConditions)
            changeOwnerPrize(challengePrizeTotalList)
            changeNumberOfParticipants(challengeParticipantNumbers)
            changeOwnerType(ownerType)

       

        }
        getOwnerChallengeList()
    }, [])

    const deleteChallenge = async (challengetitle) => {
        await window.contract.deleteOwnerChannelAll({title:challengetitle });

    }

    const acceptChallenge = async (title, entranceFeeAmount) => {
        let balance= await window.account.getAccountBalance()
        
        console.log('challenge accepted!!')

        if(Number(window.utils.format.parseNearAmount(String(entranceFeeAmount)))<Number(balance.total)){
        await  window.account.sendMoney('dev-1610478176537-9279284',window.utils.format.parseNearAmount(String(entranceFeeAmount)))
        await  window.contract.addChallengeEscrowFee({title:title, fee:Number(entranceFeeAmount)})
        await  window.contract.addToAcceptedChallenges ({title:title})
        }else{
            console.log('not enough money')
            console.log(`entrance fee is ${window.utils.format.parseNearAmount(String(entranceFeeAmount))} but all you have is ${balance.total}`)
        }
        
    }

    const startChallengeButton = async (cTitle, cType, cEndCondition) => {
        console.log(cType)
        //export function startChallenge(title:string,endCondition:i32,startStatus:i32[],participants:string[]):void{
        // step one get the initial values for the type of challenge
        // get participant list
        let cParticipants = await window.contract.getAcceptedChallengesList({ title: cTitle })

        // Now get a list of battle tags 
        let startingScore = [];
        let battleTagList = [];
        let finalScores=[];
        console.log(cTitle)

        // build start stat array  and build battle tag array 
        for (let i = 0; i < cParticipants.length; i++) {
            let startScore = 0; // starting score initial value
            let battleTag = await window.contract.getBattleTag({ name: cParticipants[i] })
            battleTagList.push(battleTag)
            console.log(cParticipants[i])
            console.log(`https://ovrstat.com/stats/pc/${battleTag}`)


            await fetch(`https://ovrstat.com/stats/pc/${battleTag}`)
                .then(res => {if(res.status!==200){alert('something is wrong with the battle tag'+battleTag)}; return res.json()})
                .then(res => {
                    startScore = res.quickPlayStats.careerStats.allHeroes.combat[cType]
                    finalScores.push(res.quickPlayStats.careerStats.allHeroes.combat[cType]+Number(cEndCondition))
                }
                )

           



        }


        await window.contract.beginChallengeStartStatus({title:cTitle})
        console.log(finalScores)
        await window.contract.addArrayOfFinalScores({title:cTitle,arrayOfScores:finalScores})
        console.log('challenge Started')
    }

    return (
        <Container>
            <Row className='d-flex justify-content-center'>
                <Table style={{ marginTop: '10%', width: '80vw' }} striped bordered hover variant="dark">
                    <thead>
                        <th colSpan={6} >
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                Challenges The User Is Participating In
          </div>

                        </th>

                        <tr>
                            <th>#</th>
                            <th>Challenge Name</th>
                            <th>Challenge Status</th>
                            <th>Entrance Fee</th>
                            <th>Challenge Response</th>



                        </tr>
                    </thead>
                    <tbody>

                        {challengeList.map((x, index) => {
                            return (

                                <tr key={index}>
                                    <td>{index}</td>
                                    <td>{x}</td>
                                    <td>{getStatusList[index]}</td>
                                    <td>{(challengeFees[index]) ? challengeFees[index] : '--'} Near</td>
                                    <td className="d-flex justify-content-center">{(getStatusList[index] === undefined) ? 'N/A' :
                                        (getStatusList) ?
                                            ((!acceptedChallenges[index]) ? (
                                                
                                                <React.Fragment className="d-flex justify-content-center">
                                                    
                                                    <Button onClick={() => acceptChallenge(x, challengeFees[index])} variant="primary">Enter!</Button>
                                                    <Button onClick={async () => { window.contract.removeFromChallengerList({ title:x }) }} variant="danger">Reject</Button></React.Fragment>) 
                                                    : 'Challenge Accepted! Entrance Fee Sent')
                                            : 'Challenge Started'
                                    }
                                    </td>



                                </tr>
                            )
                        })}




                    </tbody>
                </Table>



                <Table style={{ marginTop: '10%', width: '80vw' }} striped bordered hover variant="dark">
                    <thead>
                        <th colSpan={7} >
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                Challenges the user Owns
          </div>

                        </th>
                        <tr>
                            <th>#</th>
                            <th>Challenge Name</th>
                            <th>Challenge Status</th>
                            <th>Challenge End Condition</th>
                            <th>Challenge Winners</th>
                            <th>Challenge Start Button</th>
                            <th>Challenge Prize Total</th>
                            <th>Number of Participants</th>
                        </tr>
                    </thead>
                    <tbody>


                        {ownersChallengeList.map((x, index) => {
                            return (
                                <tr key={index}>
                                    <td>{index}</td>
                                    <td>{x}</td>
                                    
                                    <td>{(ownerChallengeStatus[index])?'challenge started':'challenge has not yet begun'}</td>
                                    <td>{getOwnerChallengeEndConditions[index]}</td>
                                    <td>{(getOwnerWinner[index] === undefined) ? 'N/A' : getOwnerWinner[index]}</td>
                                    <td ><Button onClick={() => { startChallengeButton(x, ownerType[index], getOwnerChallengeEndConditions[index]) }} variant="success">Begin Challenge</Button><Button onClick={() => deleteChallenge(x)} variant="danger">Cancel Challenge</Button></td>
                                    <td>{ownerPrize[index]}</td>
                                    <td>{numberOfParticipants[index]}</td>
                                </tr>
                            )
                        })}


                    </tbody>
                </Table>
            </Row>
        </Container>
    );
};

MyChallenges.propTypes = {

};

export default MyChallenges;