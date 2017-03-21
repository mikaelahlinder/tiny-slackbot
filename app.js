const rp = require('request-promise')
const Tobias = require('./tobias')
const WebSocketClient = require('websocket').client

const clientConnected = (connection, tobias, slack)  => {
  connection.on('error', error => console.log(`Connection Error: ${error.toString()}`))
  connection.on('close', () => console.log(`Connection Closed`))

  tobias.loadVoices('voices')

  const send = payload => {
    console.log(payload)
    connection.sendUTF(JSON.stringify(Object.assign({ id: new Date().getTime() }, payload)))
  }
  setInterval(() => send({ type: 'ping' }), 5000)
  const say = (channel, text) => send({ type: 'message', channel: channel, text: text })

  for (let shouter of tobias.shouters) {
    const channel = slack.channels.find(x => x.name === shouter.channel)
    if (channel)
      shouter.callback(channel, text => say(channel.id, text))
  }

  connection.on('message', payload => {
    const msg = JSON.parse(payload.utf8Data)
    const sender = slack.users.find(x => x.id === msg.user)
    if (slack.self.id === sender && sender.id) 
      return

    switch (msg.type) {
      case 'message':
        for (let listener of tobias.listeners) {
          const match = listener.regex.exec(msg.text)
          if (match) {
            const message = { 
              sender: { id: sender && sender.id, name: sender && sender.name },
              text: msg.text,
              match: match
            }
            listener.callback(message, text => say(msg.channel, text))
          }
        }
      break
    }
  })
}

const start = async() => {
  const url = 'https://slack.com/api/rtm.start?token=xoxb-154642148432-lEfPnIfhiHJTwbnGZp5JFOAY'
  const authenication = await rp(url).then(response => JSON.parse(response))

  const tobias = new Tobias()
  const slackClient = new WebSocketClient()
  slackClient.on('connectFailed', error => console.log(`Connection Failed ${error.toString()}`))
  slackClient.on('connect', connection => clientConnected(connection, tobias, slack)) 
  slackClient.connect(authenication.url)
}

start()