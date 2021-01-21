import { Account, connect, Contract, keyStores, WalletConnection,utils} from 'near-api-js'
import { async } from 'regenerator-runtime'
import getConfig from './config'

const nearConfig = getConfig(process.env.NODE_ENV || 'development')

// Initialize contract & set global variables
export async function initContract() {
  // Initialize connection to the NEAR testnet
  const near = await connect(Object.assign({ deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } }, nearConfig))

  // Initializing Wallet based Account. It can work with NEAR testnet wallet that
  // is hosted at https://wallet.testnet.near.org
  window.walletConnection = new WalletConnection(near)

  // Getting the Account ID. If still unauthorized, it's just empty string
  window.accountId = window.walletConnection.getAccountId()

  window.account=new Account(near.connection,window.accountId)

  window.utils=utils

  window.testBattleTag=async(name,challengeType)=>{
      let battleTag=await window.contract.getBattleTag({name:name})
      battleTag
      await fetch(`https://ovrstat.com/stats/pc/${battleTag}`)
      .then(res => { if (res.status !== 200) { alert('something is wrong with the battle tag' + battleTag) }; return res.json() })
      .then(res => {
        console.log(res.quickPlayStats.careerStats.allHeroes.combat)
        currentScoresList = res.quickPlayStats.careerStats.allHeroes.combat[challengeType]
      }
      )
  }

  // Initializing our contract APIs by contract name and configuration
  window.contract = await new Contract(window.walletConnection.account(), nearConfig.contractName, {
    // View methods are read only. They don't modify the state, but usually return some value.
    viewMethods: ['getConcludedChallenges',
    'getBattleTag',
    'checkBattleTag',
    'getTwitchHandle',
    'getChallengeDetails',
    'getParticipantList',
    'getAcceptedChallengesList',
    'getChallengeParticpantList',
    'getChallengeBal',
    'subChallengeEscrowFee',
    'getTokenBalance','test',
  'getWinner','getStartScores','getAllChallenges','getChallengeLength','getEntranceFeeAmount','getChallengeStartStatus','getOwnersChallenges','getArrayOfFinalScores'
],
        // Change methods can modify the state. But you don't receive the returned value when called.
       
        
    changeMethods: [ 'setStartScores','addToConcludedChallenges','addBattleTag',
    'setTwitch',
    'addChallengeDetails',
    'addChallengeParticipants',
    'addToAcceptedChallenges',
    'addChallengeToParticipantsList',
    'addChallengeEscrowFee',
    'addTokenBalance',
  ,'addToWinners','addToChallengeList',
  'recordChallengeEntranceFeeAmount',
  'beginChallengeStartStatus',
  'endChallengeStartStatus',
  'addArrayOfFinalScores',
  'deleteOwnerChannelAll',
  'sayHi'
],

  })
}





export function logout() {
  window.walletConnection.signOut()
  // reload page
  window.location.replace(window.location.origin + window.location.pathname)
}

export function login() {
  // Allow the current app to make calls to the specified contract on the
  // user's behalf.
  // This works by creating a new access key for the user's account and storing
  // the private key in localStorage.
  window.walletConnection.requestSignIn('')
}



