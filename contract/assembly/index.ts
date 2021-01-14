
import { Context, logging, PersistentMap, storage } from 'near-sdk-as'


// Step 1 Get Battle Tags and twitch handles 

let BattleTags= new PersistentMap<string,string>("Battle Tag")
let TwitchHandles = new PersistentMap<string,string>("Twitch Handles")

// Step 2 Make a challenge 
let challengeDetails= new PersistentMap<string,string[]>("challenge details")
let challengeParticipants=new PersistentMap<string,string[]>("challenge Participants")
let challengeBattleTags= new PersistentMap<string,string[]>("battle tags involved in a challenge ")
let allChallenges= new PersistentMap<string,string[]>("recent challenges for home page feature ")
let challengeStartStatus=new PersistentMap<string,bool>('Start status ')
let finalScoreArray=new PersistentMap<string,i32[]>("final score Array ")


// who owns the chagllenge?
let challengeOwners=new PersistentMap<string,string[]>("ChallengeOwnerList")
let challengeParticipantLists=new PersistentMap<string,string[]>(`challenger's list of challenges`)

// Step 3 Manage Challenge Fees
let challengeFeesBalance=new PersistentMap<string,i32>("challenge fee balance")
let participantsAccepted=new PersistentMap<string,string[]>("Particiants")
let challengeEntranceFee=new PersistentMap<string,i32>("entrance fee ")

// Step 4 manage User Token Balances
let TokenBalance=new PersistentMap<string,i32>('token balance')

// Step 5 conclude a challenge
let challengeWinners= new PersistentMap<string,string[]>('challenge winners ')
let concludedChallenges=new PersistentMap<string,string[]>('concluded Challenges')



// General Variables 

let allChallengesKey= 'recentChallenge'



//  ----------------------------------------------------Step 1 Get Battle Tags and Twitch Handles ------------------------------------------------// 

export function addBattleTag(name:string,battleTag:string):void{
  if (battleTag.includes("#")) {
    let splitName = battleTag.split("#")
    let reformattedName = splitName[0] + "-" + splitName[1]
    logging.log('reformatting name to:')
    logging.log(reformattedName)
    BattleTags.set(Context.sender, reformattedName)
  }
  else if (battleTag.includes('-')){
    logging.log('setting battle tag')
    BattleTags.set(Context.sender, battleTag)
  }else{
    logging.log('invalid battletag')
  }
}

export function getBattleTag(name: string): string {
  if (BattleTags.contains(name)) {
    return BattleTags.getSome(name)
  } else {
    return ""
  }
}

export function checkBattleTag(name: string): boolean {
  if (BattleTags.contains(name)) {
    logging.log('BattleTag Exists!')
    return true
  }
  else {
    logging.log('Battle Tag Does Not Exist!')
    return false
  }
}

export function setTwitch(TwitchHandle: string): void {
  TwitchHandles.set(Context.sender, TwitchHandle)
  logging.log(`Twitch handle for ${Context.sender} set to ${TwitchHandle}`)
}

export function getTwitchHandle(name: string): string {
  if (TwitchHandles.contains(name)) {
    return TwitchHandles.getSome(name)
  } else {
    return ""
  }
}



//  ----------------------------------------------------Step 2 Manage Challenge Details ------------------------------------------------// 

export function addChallengeDetails(title:string, type:string, endCondition:string ):void{
  logging.log("adding challenge I'll let you know if something goes wrong")
  logging.log('The Title of the Challenge is: ')
  logging.log(title)
  if (challengeDetails.contains(title)) {
    logging.log('challenge title established')
  } else {
    challengeDetails.set(title, [type, endCondition])
    if(challengeOwners.contains(Context.sender)){
      logging.log('adding to owners list ')
      let ownerChallenges=challengeOwners.getSome(Context.sender)
      ownerChallenges.push(title)
      challengeOwners.set(Context.sender,ownerChallenges)
    }else{
      logging.log('registering new owner ')

      challengeOwners.set(Context.sender,[title])
    }
  }
}

export function getChallengeDetails(title: string): string[] {
  if (challengeDetails.contains(title)) {
    logging.log('I found it!')
    return challengeDetails.getSome(title)
  } else {
    logging.log('no luck chuck')
    return []
  }
}

// Next two functions to be used when building a private party event 
export function addChallengeParticipants(title:string, participants:string[]):void{


    if(challengeParticipants.contains(title)){
      logging.log('adding to participant  list ')
      let currentParticipants=challengeParticipants.getSome(title)
      for(let i=0;i<participants.length;i++){
        currentParticipants.push(participants[i])
      }
      challengeParticipants.set(title,currentParticipants)
    }else{
      logging.log('registering new participant list  ')

      challengeParticipants.set(title,participants)
    }

}

export function getParticipantList (title:string):string[]{
  if(challengeParticipants.contains(title)){
    logging.log('retriving participant list for this challenge')
    return challengeParticipants.getSome(title)
  }else{
    logging.log('participant list not found for this challenge')
    return []
  }
}

export function beginChallengeStartStatus(title:string):void{
  logging.log('starting challenge')
  challengeStartStatus.set(title,true)
}

export function getChallengeStartStatus(title:string):bool{
if(challengeStartStatus.contains(title)){
  return challengeStartStatus.getSome(title)
}else{
  logging.log('challenge not found ')
  return false
}
}

export function endChallengeStartStatus(title:string):void{
  challengeStartStatus.set(title,false)
}


export function getOwnersChallenges(user:string):string[]{
  if(challengeOwners.contains(user)){
    return challengeOwners.getSome(user)
  }else{
    logging.log('user has now challenges')
    return []
  }
}

export function addToAcceptedChallenges ( title:string):void{
  if(participantsAccepted.contains(title)){
    logging.log('adding to participant list  list ')
    let currentParticipants=participantsAccepted.getSome(title)
    currentParticipants.push(Context.sender)
    participantsAccepted.set(title,currentParticipants)
  }else{
    logging.log('registering new participant list  ')

    participantsAccepted.set(title,[Context.sender])
  }
}

export function getAcceptedChallengesList (title:string):string[]{
  if(participantsAccepted.contains(title)){
    logging.log('retriving accepted participant list for this challenge')
    return participantsAccepted.getSome(title)
  }else{
    logging.log('accepted participant list not found for this challenge')
    return []
  }
}

export function addChallengeToParticipantsList(user:string,title:string):void{
  if(challengeParticipantLists.contains(user)){
    logging.log(`adding challenge to user's list `)
    let currList=challengeParticipantLists.getSome(user)
    currList.push(title)
    challengeParticipantLists.set(user,currList)
  }else{
    challengeParticipantLists.set(user,[title])
  }
}

export function getChallengeParticpantList(user:string):string[]{
  if(challengeParticipantLists.contains(user)){
    logging.log(`getting user's list of challenges`)
    return challengeParticipantLists.getSome(user)
  }else{
    logging.log('user not found')
    return []
  }
}


export function addArrayOfFinalScores(title:string,arrayOfScores:i32[]):void{
  finalScoreArray.set(title,arrayOfScores)
}

export function getArrayOfFinalScores(title:string):i32[]{
  if(finalScoreArray.contains(title)){
    return finalScoreArray.getSome(title)
  }else{
    logging.log('title not found')
    return []
  }
}
// --------------------------------------------------------- Managing Fees ---------------------------------------------// 

export function recordChallengeEntranceFeeAmount(title:string, amount:i32):void{
if(challengeEntranceFee.contains(title)){
  logging.log ('fee updated for this challenge')
  challengeEntranceFee.set(title,amount)
}else{
  logging.log('setting new entrance fee amount ')
  challengeEntranceFee.set(title,amount)
}
}

export function getEntranceFeeAmount(title:string):i32{
  if(challengeEntranceFee.contains(title)){
    return challengeEntranceFee.getSome(title)
  }else{
    logging.log('challenge does not exist ')
    return 0 
  }
}

export function addChallengeEscrowFee(title:string, fee:i32):void{
  if(challengeFeesBalance.contains(title)){
    let currBal=challengeFeesBalance.getSome(title)
    let newBal= currBal+fee
    challengeFeesBalance.set(title,newBal)
  }else{
    logging.log('initiating new balance for ')
    logging.log(title)
    logging.log('with amount of')
    logging.log(fee)
    challengeFeesBalance.set(title,fee)
  }
}


export function getChallengeBal(title:string):i32{
if(challengeFeesBalance.contains(title)){
  logging.log(`retriving balance for ${title}`)
  return challengeFeesBalance.getSome(title)
}else{
  logging.log('title not found')
  return 0
}
}

export function subChallengeEscrowFee(title:string,fee:i32):void{
  if(challengeFeesBalance.contains(title)&&challengeFeesBalance.getSome(title)>fee){
    let currBal=challengeFeesBalance.getSome(title)
    let newBal= currBal-fee
    challengeFeesBalance.set(title,newBal)
  }else{
    logging.log('either challenge does not exist or the fee subtracted is greater than the available balance ' )
  }
}

export function addTokenBalance(user:string, amount:i32):void{
  if(TokenBalance.contains(user)){
    let currBal=TokenBalance.getSome(user)
    let newBal= currBal+amount
    TokenBalance.set(user,newBal)
  }else{
    logging.log('initiating new balance')
    TokenBalance.set(user,amount)
  }
}

export function getTokenBalance(user:string):i32{
  if(TokenBalance.contains(user)){
    return TokenBalance.getSome(user)
  }else{
    logging.log('user not found')
    return 0 
  }
}

// ---------------------------------------- winners managment ----------------------------// 
export function addToWinners(title:string, users:string[]):void{
  if(challengeWinners.contains(title)){
    logging.log('winner already exist')
  }else{
    challengeWinners.set(title,users)
  }
}

export function getWinner(title:string):string[]{
  if(challengeWinners.contains(title)){
    return challengeWinners.getSome(title)
  }else{
    logging.log('winner not found for this challenge' )
    return []
  }
}


export function addToChallengeList(title:string):void{
  if (allChallenges.contains(allChallengesKey)){
    let listOfChallenges=allChallenges.getSome(allChallengesKey);

      listOfChallenges.push(title)
      allChallenges.set(allChallengesKey,listOfChallenges)
  }else{
    allChallenges.set(allChallengesKey,[title])
  }
}

export function getAllChallenges():string[]{
  if (allChallenges.contains(allChallengesKey)){
      return  allChallenges.getSome(allChallengesKey)
}else{
  logging.log('no titles have been entered yet')
  return([])
}
}

export function getChallengeLength():i32{
  if(allChallenges.contains(allChallengesKey)){
    let list= allChallenges.getSome(allChallengesKey)
    return list.length
  }else{
    return 0
  }
}

export function deleteOwnerChannelAll(title:string):void{
  // get challenge participants 
  if(challengeParticipants.contains(title)){
  let listOfPeopleForThisChallenge=challengeParticipants.getSome(title)
  // get user's lists
  for(let i=0; i<listOfPeopleForThisChallenge.length;i++){
   let user= listOfPeopleForThisChallenge[i];
      let  challengeList=challengeParticipantLists.getSome(user)
      let indexOfChallenge=challengeList.indexOf(title)
      challengeList.splice(indexOfChallenge,1)
      challengeParticipantLists.set(user,challengeList)

  }
  }else{
    logging.log('no list of participants found for htis challenge')
  }
  let ownerChallenges=challengeOwners.getSome(Context.sender)
  if(ownerChallenges.includes(title)){
  ownerChallenges.splice(ownerChallenges.indexOf(title),1)
  challengeOwners.set(Context.sender,ownerChallenges)
}else{
  logging.log('not found in challenge owners list ')
}
 
  if(challengeDetails.contains(title))
  {challengeDetails.delete(title)}
  else{logging.log('no details found')}

  if(challengeParticipants.contains(title))
  {challengeParticipants.delete(title)}
  else{logging.log('no details found')}
  if(challengeStartStatus.contains(title))
  {challengeStartStatus.delete(title)}
  else{logging.log('no start status found')}
  if(finalScoreArray.contains(title))
  {finalScoreArray.delete}
  else{logging.log('no final score found')}
}


export function addToConcludedChallenges(title:string):void{
  if(concludedChallenges.contains(title)){
    logging.log('challenge already concluded')
  }
  else{
    if(concludedChallenges.contains('finished')){
    let currList=concludedChallenges.getSome('finished')
    concludedChallenges.set('finished',[...currList,title])
    }else{
      concludedChallenges.set('finished',[title])
    }
  }
}

export function getConcludedChallenges():string[]{
  return concludedChallenges.getSome('finished')
}