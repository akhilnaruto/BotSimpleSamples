var builder = require('botbuilder');
var restify = require('restify');

var server = restify.createServer();
server.listen(3978,function(){
    console.log('%s listening to %s', server.name , server.url)
});

var connector = new builder.ChatConnector();
server.post('/api/messages',connector.listen());

var HelpMessage = '\n * If you want to know which city I\'m using for my searches type \'current city\'. \n *'
             +'Want to change the current city? Type \'change city to cityName\'. \n *'
             +'Want to change it just for your searches? Type \'change my city to cityName\'';
var userNameKey = 'UserName';
var userWelcomedKey = 'UserWelcomed';
var CityKey= 'City';

var bot = new builder.UniversalBot(connector,function(session){
    if(!session.conversationData[CityKey]){
        session.conversationData[CityKey] = 'Seattle';
        session.send('Welcome to the search city bot. I am currently configured to search for'
                +'things in %s',session.conversationData[CityKey]);
    }

    var userName = session.userData[userNameKey];
    if(!userName){
        return session.beginDialog('greet');
    }

    if(!session.privateConversationData[userWelcomedKey]){
        session.privateConversationData[userWelcomedKey] = true;
        return session.send('Welcome back %s , Remember the rules : %s', userName , HelpMessage);
    }

    session.beginDialog('search');
});

bot.set('persistConversationData',true);

bot.dialog('search', function(session,args,next){
    // perform search
    var city = session.privateConversationData[CityKey] || session.conversationData[CityKey];
    var userName = session.userData[userNameKey];
    var messageText = session.message.text.trim();
    session.send('%s , Please wait for few seconds. searching for \'%s\' in \'%s\'...' , userName , messageText , city);
    session.send('https://www.bing.com/search?q=%s', encodeURIComponent(messageText + ' in ' + city)); 
    session.endDialog();
});

bot.dialog('reset', function(session){
     delete session.userData[userNameKey];
     delete session.conversationData[CityKey];
     delete session.privateConversationData[CityKey];
     delete session.privateConversationData[userWelcomedKey];
     session.endDialog('Ups..Im suffering from a memory loss');
});

// print current city dialog
bot.dialog('printCurrentCity',function(session){
    var userName = session.userData[userNameKey];
    var defaultCity = session.conversationData[CityKey];
    var userCity = session.privateConversationData[CityKey];
    if(!defaultCity){
        session.endDialog('I dont have search city configured');
    }else if(userCity){
        session.endDialog(
            '%s , you have overriden the city. Your searches are for things in %s. The default conversation city is %s.',
            userName,userCity,defaultCity);
    }else{
        session.endDialog('Hey %s, I\'m currently configured to search for things in %s.', userName, defaultCity);
    }

}).triggerAction({matches:/^current city/i});

//change current city dialog
bot.dialog('changeMyCurrentCity',function(session,args){
       var newCity = args.intent.matched[1].trim();
       session.privateConversationData[CityKey] = newCity;
       var userName = session.userData[userNameKey];
       session.endDialog('All Set %s . I have overridden the city to %s just for you', userName , newCity);
}).triggerAction({ matches: /^change my city to (.*)/i });

// Greet Dialog
bot.dialog('greet', new builder.SimpleDialog(function (session, results)    {
    if (results && results.response) {
        session.userData['UserName'] = results.response;
        session.privateConversationData['UserWelcomed'] = true;
        return session.endDialog('Welcome %s! %s', results.response, HelpMessage);
    }

    builder.Prompts.text(session, 'Before get started, please tell me your name?');
}));