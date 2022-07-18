module.exports = async function (proposal, state, action) {
    if (!proposal.data || typeof proposal.data !== "object" || !proposal.data.threshold || typeof proposal.data.threshold !== "number") {
        throw new ContractError("Invalid threshold")
    }
    state.threshold = proposal.data.threshold
    return {
        state
    }
}