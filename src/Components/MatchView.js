import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {Table,Container,Row} from 'react-bootstrap'
import { async } from 'regenerator-runtime';

const MatchView = props => {



const [winners,changeWinners]=useState([])
const [challenge,changeChallenge]=useState([])

useEffect(()=>{
    const getWinners=async()=>{
        let recentCallengesList=await window.contract.getConcludedChallenges()
        console.log(recentCallengesList)
        let challengeWinnersList=recentCallengesList.map(async(x)=>{return await window.contract.getWinner({title:x})})
        changeWinners(challengeWinnersList)
        changeChallenge(recentCallengesList)


    }
    getWinners();
}


, [])

    return (
        <Table striped bordered hover variant="dark">
            <thead>
                <tr> 
                    <th>#</th>
                    <th> Challenge Name </th>
                    <th> Winner </th>
                   
                </tr>
            </thead>

            <tbody>
            {winners.map((x,index)=>{
                return(
                    <tr key={index}>
                        <td>{index}</td>
                        {/* <td>{x}</td>
                        <td>{challenge[index]}</td> */}
                    </tr>
                )
            })}
            </tbody>
           
        </Table>

    );
};

MatchView.propTypes = {
    
};

export default MatchView;