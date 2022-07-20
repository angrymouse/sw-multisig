const Arweave = require("arweave");
const { WarpNodeFactory } = require("warp-contracts");
module.exports = async function (jwk) {
    let powers = {}
    console.log(chalk.bgGreen(" List all multisig members you want to add (each address on new line). If you want to change default member's power (1), provide it using \":\" after address (like \"address:power\"). Enter \"end\" to finish adding addresses."))
    let lastAddress;
    while (lastAddress !== "end") {
        lastAddress = await prompt("Enter address: ")
        if (lastAddress != "end") {
            let [address, power] = lastAddress.split(":")
            if (power === undefined) {
                power = 1
            } else {
                power = parseFloat(power)
            }
            powers[address] = power
        }
    }
    let totalPowers = Object.values(powers).reduce((pv, cv) => pv + cv, 0)
    console.log(chalk.bgGreen(" Nice! Here is list of addresses that you have added: "))
    console.log(Object.entries(powers).map(([address, power]) => {
        return `${chalk.blue(address)} with voting power of ${chalk.red(power)} (${chalk.yellow(((power/totalPowers)*100).toFixed(2)+"%")})`
    }).join("\n"))
    console.log(chalk.bgGreen(" Now provide threshold for this multisig (power needed for proposal to pass) "))
    let threshold = parseFloat(await prompt("Enter signature threshold: "))
    console.log(" You are almost there! With total power of " + chalk.red(totalPowers) + ", total members amount of " + chalk.red(Object.keys(powers).length) + ", and threshold of " + chalk.red(threshold) + ", are you okay with multisig creation? (yes/no)")
    let create = (await prompt(`Confirm multisig creation? (${chalk.green("YES")}/${chalk.red("NO")}): `)).toLowerCase()
    if (!create.startsWith("y")) {
        console.log(chalk.red("Multisig creation aborted"))
    }
    let initState = {
        name: "SmartWeave FCP multisig",
        canEvolve: true,
        evolve: null,
        powers: powers,
        threshold: threshold,
        proposals: {},
        foreignCalls: []
    }
    const {
        build
    } = require('esbuild');
   

    const contracts = ['/contract.js'];
    console.log(chalk.blue("BUIDLing contract..."))
    let buildResult=await build({
            entryPoints: contracts.map((source) => {
                return `./src${source}`;
            }),
            outdir: './dist',
            minify: false,
            write:false,
            bundle: true,
            format: 'iife',
        })

        let code=Buffer.from(buildResult.outputFiles[0].contents).toString("utf8").slice(8,-6)
        console.log(chalk.green("Built contract!"))
      console.log(chalk.blue("Deploying contract..."))
      const arweave = Arweave.init({
        host: "arweave.net",
        port: 443,
        protocol: "https",
      });
      const warp = WarpNodeFactory.memCached(arweave);
      const contractTx = await warp.createContract.deploy({
        wallet: jwk,
        initState: JSON.stringify(initState),
        src: code
      });    
      console.log(chalk.green("Successfully deployed contract!"))
      console.log(`${chalk.bgGreen("Your multisig was successfully deployed to Arweave!")}\nMultisig address: ${chalk.blue(contractTx.contractTxId)}`)
}