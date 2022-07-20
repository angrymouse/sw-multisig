module.exports = async function (jwk, contract, contractState, contractId, arweave, warp) {
   let proposalId=await prompt("Enter proposal ID: ")
   let arAddress=await arweave.wallets.getAddress(jwk)
   if(!contractState.proposals[proposalId]){
    return console.log(chalk.bgRed("Proposal with this ID not exists on weave!"))
   }
   let proposal=contractState.proposals[proposalId]
   console.log(chalk.blue("Proposal summary:"))
   console.log(await (({
    "call-contract":async()=>`This proposal will call contract ${chalk.blue(proposal.data.contract)} from behalf of multisig via Foreign Call Protocol.\nThis smart contract will be called with input below:`,
    "change-member-power":async()=> `This proposal will set voting power of ${chalk.blue(proposal.member)} to ${chalk.green(proposal.power)}, or ${chalk.blue(((proposal.data.power/contractState.threshold)*100).toFixed(2)+"%")} of total voting power of this multisig. ${proposal.data.power<0?"It will remove member from this multisig.":""}. ${proposal.data.power==0?"This proposal will remove right to vote, but user will still be able to make proposals":""}`,
    "set-threshold": async() =>`This proposal will set threshold, minimal power needed to sign transaction from this multisig account, to ${chalk.blue(proposal.data.threshold)}, equal to ${chalk.blue(((proposal.data.threshold/contractState.threshold)*100).toFixed(2)+"%")} of total voting power of this multisig.`
})[proposal.type])())
   if(proposal.type=="call-contract"){
    console.log(proposal.data.input)
   }
   console.log(`Currently this proposal has ${chalk.red(proposal.signers.length)} signs with total power of ${chalk.red(proposal.total)} (${chalk.blue(((proposal.total/contractState.threshold)*100).toFixed(2)+"%")} of all multisig voting power). This proposal will pass after ${contractState.threshold-proposal.total} of voting power will be added. After your vote this proposal will ${proposal.total+contractState.powers[arAddress]>=contractState.threshold?"":"not"} pass.`)
   console.log(chalk.bgRed(" List of signers: "))
   console.log(proposal.signers.map((m)=>chalk.red(m)).join("\n"))
let confirm = await prompt("Do you really want to sign this proposal? (Y/n): ")
   if (!confirm.toLowerCase().startsWith("y")) {
       console.log(chalk.bgRed("Transaction rejected"))

       return null
   }else{
    let tx=await contract.writeInteraction({function:"sign",proposal:proposalId})
    console.log(chalk.bgGreen(" Successfully signed proposal! ")+chalk.green(` (${tx})`))
   }
}