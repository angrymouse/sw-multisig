module.exports=async function (state,action){
    if(!Object.keys(state.powers).includes(action.caller)){
        throw new ContractError("You must be multisig member to sign action")
    }
    if(!action.input.proposal||typeof action.input.proposal!=="string"){
        throw new ContractError("Invalid proposal")
    }
    if(!state.proposals[action.input.proposal]){
        throw new ContractError("Proposal not found in contract state")
    }
    let proposal=state.proposals[action.input.proposal]
    if(proposal.signers.includes(action.caller)){
        throw new ContractError("You already signed this proposal")
    }
    proposal.signers.push(action.caller)
    proposal.total+=state.powers[action.caller]
    if(proposal.total>=state.threshold){
        return await (({
            "call-contract":require("../actions/call-contract.js"),
            "change-member-power":require("../actions/change-member-power.js"),
            "set-threshold":require("../actions/set-threshold.js")
        })[proposal.type]||(()=>{throw new ContractError("Invalid proposal structure")}))(proposal,state,action)
    }
    return {state}
}