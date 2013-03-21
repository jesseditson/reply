reply
=====

A bot for replying to twitter posts that match criteria

##Usage:

####Prerequisites:

Create a twitter app:

- go to https://dev.twitter.com/
- sign in with an account or create one (¡WARNING: YOU MAY FLOOD TWITTER WITH TWEETS FROM THIS ACCOUNT. BE CAREFUL!)
- add a new application
- go to the settings for the app, and set it to "Read & Write" Access
- go to the application credentials page and generate an access token in the "Your access token" section

you'll use the tokens from this page later. Keep it open.

####Local Setup:

clone this repo.

add a file called `runtime.json` to the `config` directory.

put a config in it like this:

    {
      "twitter" : {
        "consumer_key" : "<your consumer key>",
        "consumer_secret" : "<your consumer key>",
        "access_token_key" : "<your access token>",
        "access_token_secret" : "<your access token secret>"
      },
      "keywords" : "words to match in tweet",
      "match" : "a string or regex. (capture groups are allowed)",
      "replies" : [
        "some reply. Can reference parts of the tweet like [user.screen_name] or regex matches like $1"
      ],
      "max_replies_per_minute" : 6,
      "in_reply_to" : true
    }

This should be somewhat self explanatory, here's the idea:

when a tweet matches the keywords (as detailed [here](https://dev.twitter.com/docs/streaming-apis/parameters#track "Twitter Track Parameter Docs")), it will be tested against the "match" param, and replied to if it passes.

**match** can be a string, or a regex. All regexes are case insensitive, but you can specify capture groups to use in your replies if you want.

**replies** is an array. A random reply will be selected from this array, parsed, and tweeted by the authenticating account.
**replies** will replace `$n` items with matches from the original tweet.
**replies** can contain square-bracket surrounded attributes to pick from the original tweet too. You can see the options in the example response [here](https://dev.twitter.com/docs/api/1.1/get/statuses/show/%3Aid "Twitter Show Status Docs"). For instance (and probably the most useful), you could at-tweet a user by adding `@[user.screen_name]` to the beginning of a reply.

**max_replies_per_minute** is there to help you not hit the API limits. 1000/day is the global limit. This will only tweet when it can though, so if there is ALWAYS a tweet to respond to queueing up, the max would be 0.695. However, this is unlikely for normal uses, so your number could be considerably higher. Default is one per minute.

**in_reply_to** will mark the tweet as being in reply to the tweet. This will cause twitter to show it in the conversation view. Turn it off if you're just randomly tweeting.

####Heroku Deployment:

To make it even easier to spam the world, you can deploy this to a heroku app with very little setup:

copy or create a `heroku.json` file inside the `config` directory. Same params as above.

Install the [Heroku Toolbelt](https://toolbelt.heroku.com/)

install the `config-heroku` command line:

    npm install -g config-heroku

type `heroku create <your clever app name>` into your terminal in the same directory as this app.

type `config-heroku save`, and when prompted (after confirming your config) enter `y` and hit enter *twice* (sorry, that's a bug...)

type `git push heroku`

Lastly, you'll want to add the newrelic standard addon - not for the monitoring, but it'll ping your app twice a minute. This will prevent Heroku from idling your app and causing the dyno to spin down (and all your tweets to stop):

`heroku addons:add newrelic:standard`

now your annoying twitter bot is running in the cloud like a boss. If you're interested in what it's doing you can type `heroku logs -t`, and you'll get streaming logs of what it's been up to.


####Notes:

This project was inspired by a tweet by @startupljackson. I don't know him, but somebody retweeted it and I thought it was a good idea.

<blockquote class="twitter-tweet"><p>Who wants to build me a bot? @<a href="https://twitter.com/zomfgmayor">zomfgmayor</a> will reply to those "I just ousted X as mayor of Y" tweets w "Nobody gives a shit, douche nozzle."</p>&mdash; Startup L. Jackson (@StartupLJackson) <a href="https://twitter.com/StartupLJackson/status/314180753573416960">March 20, 2013</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

Here's the config to use this lib to do what is described in that tweet:

    {
      "twitter" : {
        "consumer_key" : "<your consumer key>",
        "consumer_secret" : "<your consumer key>",
        "access_token_key" : "<your access token>",
        "access_token_secret" : "<your access token secret>"
      },
      "keywords" : "I just ousted",
      "match" : "I just ousted @([\\w]+) as the mayor of (.+?) on @foursquare!",
      "replies" : [
        "@[user.screen_name] Nobody Gives a shit, douchenozzle."
      ]
    }

As of this writing, the bot described above is running under the twitter account [@nobodygivesshit](https://twitter.com/nobodygivesshit).

Startup L. Jackson, if you want the keys they're yours, or I'll shut that one down if you want to set up a different reply repo.

#### License:

You're free to use this for anything you want as long as you follow these rules:

    Don't be a dick

####Bugs:

Bugs can be filed here in github, or by contacting me directly:

#####Jesse Ditson

#####(twitter) @jesseditson

#####(email) jesse.ditson@gmail.com
