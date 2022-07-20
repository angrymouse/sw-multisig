const Arweave = require("arweave");
const {
    WarpNodeFactory,LoggerFactory
} = require("warp-contracts");

module.exports = async function (jwk) {
    LoggerFactory.INST.logLevel('fatal');
    const arweave = Arweave.init({
        host: "arweave.net",
        port: 443,
        protocol: "https",
    });
    const warp = WarpNodeFactory.memCached(arweave);
    let arweaveAddress =await arweave.wallets.getAddress(jwk)
    let contractId = await prompt("Paste address of multisig you want to manage: ")
    const contract = warp.contract(contractId).connect(jwk);
    let contractState = (await contract.readState()).state
    
    if (!contractState.powers[arweaveAddress]) {
        return console.log(chalk.bgRed(" Provided wallet is not member of this multisig! "))
    }
    manageMultisigMenu(jwk, contract, contractState, contractId, arweave, warp)

}
async function manageMultisigMenu(jwk, contract, contractState, contractId, arweave, warp) {
    console.log(chalk.bgBlue(" --- SELECT OPTION --- "))
    console.log("")
    console.log(chalk.bgBlue(" 1. Create proposal "))
    console.log(chalk.bgBlue(" 2. Sign proposal "))
    let answer = await prompt("Enter option number: ")

    return await (({
        "1": require("./manage/create-proposal.js"),
        "2": require("./manage/sign-proposal.js")
    })[answer] || (() => {
        console.log(chalk.bgRed(" Invalid option "));
        manageMultisigMenu(jwk, contract, contractState, contractId, arweave, warp)
    }))(jwk, contract, contractState, contractId, arweave, warp)
}