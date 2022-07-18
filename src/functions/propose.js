module.exports=async function (state,action){

    if(!Object.keys(state.powers).includes(action.caller)){
        throw new ContractError("You must be multisig member to propose action")
    }
    if(!["call-contract","change-member-power","set-threshold"].includes(action.input.type)){
        throw new ContractError("Invalid action")
    }
    if(!action.input.data||typeof action.input.data!=="object"){
        throw new ContractError("Invalid data (details of action)")
    }
    state.proposals[SmartWeave.transaction.id]={
        type:action.input.type,
        data:action.input.data,
        signers:[],
        total:0
    }
    return {state}
}