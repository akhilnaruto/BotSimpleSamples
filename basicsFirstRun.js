var builder = require('botbuilder');
var restify = require('restify');

var server = restify.createServer();
server.listen(3978,function(){
    console.log('% listening to %s', server.name , server.url);
});

var connector = new builder.ChatConnector();
server.post('/api/messages',connector.listen());

var bot = new builder.UniversalBot(connector,function(session){
   session.send('%s, I heard %s ', session.userData.name , session.message.text);
   session.send("say 'help' or something else");
});

bot.dialog('firstRun',[
     function(session){
         session.userData.version = 1.0;
         builder.Prompts.text(session, 'Hello.. whats your name ?')
     },
     function(session,results){
         session.userData.name = results.respnse;
         session.endDialog('Hi %s , say something to me and i l echo it back', session.userData.name);
     }
]).triggerAction({
    onFindAction : function(context,callback){
        var version = context.userData.version || 0;
        var score = version < 1.0 ? 1.1: 0.0;
        callback(null , score);
    },
    onInterrupted:function(session,dialogId,dialogArgs,next){
        session.send('Sorry ... we need some information first');
    }
});

bot.dialog('help',function(session){
   session.send('I am a simple echo bot');
}).triggerAction({matches:/^help/i});