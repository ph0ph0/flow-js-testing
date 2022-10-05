/*
 * Flow JS Testing
 *
 * Copyright 2020-2021 Dapper Labs, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {getManagerAddress} from "./manager"
import {executeScript} from "./interaction"
import {defaultsByName} from "./file"

import registry from "./generated"

/**
 * Returns address of the account where contract specified by name is currently deployed
 * @param {string} name - name of the account to look for
 * @param {boolean} [useDefaults=false] - whether we shall look into default addressed first
 * @returns {Promise<string>}
 */
export const getContractAddress = async (name, useDefaults = false) => {
  // TODO: Maybe try to automatically deploy contract? 🤔
  console.log(`Running get contract address!`)

  if (useDefaults) {
    const defaultContract = defaultsByName[name]
    if (defaultContract !== undefined) {
      return defaultContract
    }
  }

  const managerAddress = await getManagerAddress()
  const addressMap = {FlowManager: managerAddress}

  console.log(
    `managerAddress in getContractAddress: ${JSON.stringify(managerAddress)}`
  )

  const code = await registry.scripts.getContractAddressTemplate(addressMap)

  console.log(`code in getCA: ${JSON.stringify(code)}`)
  const args = [name, managerAddress]
  const [contractAddress] = await executeScript({
    code,
    args,
    service: true,
  })

  console.log(
    `contract address retrieved for name ${name} is: ${contractAddress}`
  )

  console.log(`^^^^^^^^^^^^^^^^^^^^^^Running my script`)

  const res = await executeScript({
    printAccountsScript,
    args,
    service: true,
  })

  console.log(`%$%$%$%%$%$%$%$%$%$%$%%$%$%$%$%%$%$res: ${JSON.stringify(res)}`)

  // contractAddress is null here

  return contractAddress
}

let printAccountsScript = `
  import FlowManager from 0x01

pub fun main(managerAccount: Address): {String: Address} {
    let manager = getAccount(managerAccount)
    let linkPath = FlowManager.contractManagerPath
    let contractManager = manager
                        .getCapability(linkPath)
                        .borrow<&FlowManager.Mapper>()!

    return contractManager.accounts
}
`

export const getFlowManagerContracts = async () => {
  const args = [getManagerAddress()]
  return await executeScript({
    printAccountsScript,
    args,
    service: true,
  })
}
