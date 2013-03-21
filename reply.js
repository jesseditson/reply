var reply = require('./lib/reply')

if(require.main !== module){
  module.exports = reply
} else {
  var config = require('config-heroku')
  reply(config)
  // couldn't figure out how to make heroku think this is a valid worker. this will work for now:
  if(process.env.PORT){
    require('http').createServer(function(req,res){
      res.end('nothing to see here...')
    }).listen(process.env.PORT)
  }
}