module.exports = async function (proposal, state, action) {
    if (!proposal.data || typeof proposal.data !== "object" || !proposal.data.member || !proposal.data.power || typeof proposal.data.power !== "number" || typeof proposal.data.member !== "string") {
        throw new ContractError("Invalid proposal")
    }
    if (proposal.data.power < 0) {
        delete state.powers[proposal.data.member]
    } else {
        state.powers[proposal.data.member] = proposal.data.power
    }

    return {
        state
    }
}