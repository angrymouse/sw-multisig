module.exports = async function (proposal, state, action) {
    if (!proposal.data || typeof proposal.data !== "object" || !proposal.data.contract || !proposal.data.input) {
        throw new ContractError("Invalid proposal")
    }
    state.foreignCalls.push({
        txID: SmartWeave.transaction.id,
        contract: proposal.data.contract,
        input: proposal.data.input
    });
    return {
        state
    }
}