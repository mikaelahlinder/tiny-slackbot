module.exports = tiny => {
  tiny.listen(/.*/i, (send, match) => {
    send(`Du sa ${match[0]}`)
  })
  tiny.listen(/sune/i, send => {
    send('Jaaaaaaaaa')
  })
  tiny.speak(/aptitud/i, send => {
    send('Sune här!')
  })
}