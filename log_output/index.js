const generateRandomString = () => Math.random().toString(36).substr(2, 6)

const timeStamp = () => new Date().toISOString()

const output = (outputString) => {
  stringWithTS = `${timeStamp()}: ${outputString}`
  console.log(stringWithTS)
  setTimeout(() => output(outputString), 5000)
}

const randomString = generateRandomString()

output(randomString)