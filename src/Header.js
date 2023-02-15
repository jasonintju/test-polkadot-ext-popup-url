import { Link, useLocation } from "react-router-dom"
import { WsProvider, ApiPromise } from "@polkadot/api"
import { web3Accounts, web3Enable } from "@polkadot/extension-dapp"
import { useEffect, useState } from "react"

const NAME = 'TEST_POLKADOT_EXT'

export default function Header() {
    let { pathname } = useLocation()

    const [api, setAPi] = useState()
    const [accounts, setAccounts] = useState([])
    const [selectedAccount, setSelectedAccount] = useState()
    
    const setup = async () => {
        const wsProvider = new WsProvider('wss://ws.calamari.systems')
        const api = await ApiPromise.create({ provider: wsProvider })
        setAPi(api)
    }
    
    const handleConnect = async () => {
        const extensions = await web3Enable(NAME)
        if (!extensions) {
            throw Error('NO_EXTENSION_FOUND')
        }
        const allAccounts = await web3Accounts()
        setAccounts(allAccounts)
        console.log(allAccounts)

        if (allAccounts.length === 1) {
            setSelectedAccount(allAccounts[0])
        }
    }

    const handleAccountSelect = async (e) => {
        const selectedAddress = e.target.value
        const account = accounts.find(account => account.address === selectedAddress)
        if (!account) {
            throw Error('NO_ACCOUNT_FOUND')
        }
        setSelectedAccount(account)
    }

    useEffect(() => {
        setup()
    }, [])

    useEffect(() => {
        if (!api) return

        (async () => {
            const time = await api.query.timestamp.now()
            console.log(time.toPrimitive())
        })()
    }, [api])

    return (
        <div className="navbar">
            <Link className={`link ${pathname === '/page1' && 'selected'}`} to="/">Page1</Link>
            <Link className={`link ${pathname === '/page2' && 'selected'}`} to="/page2">Page2</Link>
        
            {
                accounts.length === 0 && <button className="connect-btn" onClick={handleConnect}>connect</button>
            }

            {
                accounts.length > 0 && !selectedAccount && (
                    <select onChange={handleAccountSelect} defaultValue="">
                        <option value="" disabled hidden>Choose your account</option>
                        {
                            accounts.map(account => (
                                <option key={account.address}>{account.address}</option>
                            ))
                        }
                    </select>
                )
            }

            {
                selectedAccount && selectedAccount.address
            }
        </div>
    )
}