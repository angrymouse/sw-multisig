module.exports = async function (jwk, contract, contractState, contractId, arweave, warp) {
    console.log(chalk.bgBlue(" --- SELECT PROPOSAL TYPE --- "))
    console.log("")
    console.log(chalk.bgBlue(" 1. Call smart contract via Foreign Call Protocol "))
    console.log(chalk.bgBlue(" 2. Edit multisig member power (can also be used to add/remove members from multisig)"))
    console.log(chalk.bgBlue(" 3. Set multisig threshold"))
    let answer = await prompt("Enter option number: ")

    let propType = await (({
        "1": () => "call-contract",
        "2": () => "change-member-power",
        "3": () => "set-threshold"
    })[answer] || (() => {
        console.log(chalk.bgRed(" Invalid proposal type "));
        module.exports(jwk, contract, contractState, contractId, arweave, warp)
        return null
    }))(jwk, contract, contractState, contractId, arweave, warp)
    if (!propType) {
        return
    }
    let resultTx = await (({
        "call-contract": async () => {
            let contractAddress = await prompt("Enter address of contract you would want to call from multisig: ")
            console.log(chalk.bgGreen(`Insert input for FCP call (JSON). Multiline supported, when you will finish inserting input, enter "${chalk.bgBlue("END")}" in next line."`))
            console.log("")
            let input = await multilineJsonPrompt()
            console.log("Confirm that you want to call " + chalk.yellow(contractAddress) + " from " + chalk.blue(contractId) + " with input below: \n", input)
            let confirm = await prompt("Are you sure? (Y/n): ")
            if (!confirm.toLowerCase().startsWith("y")) {
                console.log(chalk.bgRed("Transaction rejected"))

                return null
            } else {
                return {
                    function: "propose",
                    type: "call-contract",
                    data: {
                        contract: contractAddress,
                        input: input
                    }
                }
            }
        },
        "change-member-power": async () => {
            let memberAddress=await prompt("Enter address of member power of which you want to edit: ")
            console.log(chalk.blue(`Enter new power for this member. ${chalk.yellow(0)} will let him submit proposals, but not vote on it, ${chalk.yellow(-1)} will remove him from multisig, ${chalk.yellow(1)} and more is usual multisig membership, with submission and voting power.`))
            let newPower=parseFloat(await prompt("Enter new member power: "))
            console.log("Confirm that you want to set voting power of " + chalk.blue(memberAddress) + " to " + chalk.yellow(newPower))
            let confirm = await prompt("Are you sure? (Y/n): ")
            if (!confirm.toLowerCase().startsWith("y")) {
                console.log(chalk.bgRed("Transaction rejected"))

                return null
            }else{
                return {
                    function:"change-member-power",
                    member:memberAddress,
                    power:newPower
                }
            }


        },
        "set-threshold": async() => "set-threshold"
    })[propType])(jwk, contract, contractState, contractId, arweave, warp)
    if (!resultTx) {
        return
    }
    console.log(chalk.blue("Broadcasting transaction..."))
    let wroteInteraction= await contract.writeInteraction(resultTx)
    console.log(chalk.green("Proposal created! Vote for it and tell other multisig members to vote for it too! When this proposal will get votes with total voting power of " + chalk.red(contractState.threshold) + ", it will become valid and broadcastable."))
    console.log(chalk.blue("Proposal ID: "+chalk.red(wroteInteraction)))
    return
}