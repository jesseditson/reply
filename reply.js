// set up some stuff
var request = require('request')
var config = require('config-heroku')
if(!config.twitter) throw new Error("No Twitter config object in your config file. add one.")
if(!config.twitter.consumer_key) throw new Error("No Twitter consumer_key in your config file. add one.")
if(!config.twitter.consumer_secret) throw new Error("No Twitter consumer_secret in your config file. add one.")
if(!config.twitter.access_token_key) throw new Error("No Twitter access_token_key in your config file. add one.")
if(!config.twitter.access_token_secret) throw new Error("No Twitter access_token_secret in your config file. add one.")

var twitter = new require('ntwitter')(config.twitter)
var oAuthTwitterConfig = {
  token : config.twitter.access_token_key,
  token_secret : config.twitter.access_token_secret,
  consumer_key : config.twitter.consumer_key,
  consumer_secret : config.twitter.consumer_secret
}

if(!config.keywords) throw new Error("No keywords found in config. Please add a keywords string.")
if(!config.match) throw new Error("No match object found in config. Please add a match regex.")
if(!config.replies) throw new Error("No replies array found in config. Please add a replies array.")
var match = config.match
var replies = config.replies
var keywords = config.keywords
if(Array.isArray(keywords)) keywords = keywords.join(',')
var match = match
try {
  match = new RegExp(match,'i')
} catch(e){
  console.warn('failed to parse match as a regex. Will try to match as a string, but no promises.')
}

var parseTemplates = function(reply,tweet,parent){
  parent = parent ? parent + '.' : ''
  Object.keys(tweet).forEach(function(t){
    var val = tweet[t]
    var valKeys = 0
    try { valKeys = Object.keys(val).length } catch(e) {}
    if(typeof val == 'string'){
      reply = reply.replace('['+parent+t+']',val)
    } else if(valKeys > 0) {
      reply = parseTemplates(reply,val,t)
    }
  })
  return reply
}

var getReply = function(tweet,matches){
  var index = Math.floor(Math.random() * replies.length)
  var reply = replies[index]
  matches.forEach(function(match,index){
    if(index == 0) return
    reply = reply.replace('$'+index,match)
  })
  return parseTemplates(reply,tweet)
}

var postReply = function(reply,tweet,callback){
  var reqOptions = {
    url: 'https://api.twitter.com/1.1/statuses/update.json',
    oauth: oAuthTwitterConfig,
    form : {
      status : reply
    }
  }
  console.log("posting: ",reply)
  if(config.in_reply_to){
    reqOptions.form.in_reply_to_status_id = tweet.id
    console.log("in reply to ",tweet.text)
  }
  request.post(reqOptions,function(err,res,body){
    try {
      body = JSON.parse(body)
    } catch(e){ err = e }
    if(body && body.errors) body.error = body.errors[0]
    if(err || body.error) return callback(err || body.error)
    return callback(null,body)
  })
}

var lastReplied = false
var maxRepliesMs = config.max_replies_per_minute ? 60000 / config.max_replies_per_minute : 60000

// start streaming tweets
twitter.stream('statuses/filter', {'track':keywords}, function(stream) {
  stream.on('data',function(tweet){
    if(!lastReplied || ((new Date().getTime() - lastReplied) > maxRepliesMs)){
      lastReplied = new Date().getTime()
      var matches = tweet.text.match(match)
      if(matches){
        postReply(getReply(tweet,matches),tweet,function(err,response){
          if(err) console.error("Got error posting tweet: ",err,"full response:",response);
        })
      }
    }
  })
  stream.on('error',function(e){
    console.error("Got an error streaming tweets: ",e.stack)
  })
})

// couldn't figure out how to make heroku think this is a valid worker. this will work for now:
if(process.env.PORT){
  require('http').createServer(function(req,res){
    res.end('nothing to see here...')
    res.listen(process.env.PORT)
  })
}