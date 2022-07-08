import path from "path"
import {init, emulator, executeScript} from "../src"

;(async () => {
  const basePath = path.resolve(__dirname, "./cadence")

  await init(basePath)
  await emulator.start()

  const code = `
    pub fun main(data: {String: UInt32}, key: String): UInt32?{
      return data[key]
    }
  `

  const args = [{cadence: 0, test: 1337}, "cadence"]

  const [result] = await executeScript({code, args})
  console.log({result})

  // Stop the emulator
  await emulator.stop()
})()
