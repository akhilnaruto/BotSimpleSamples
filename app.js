var restify = require('restify');
var builder = require('botbuilder');

var server = restify.createServer();
server.listen(3978,function(){
    console.log('%s listening to %s', server.name , server.url);
});

var connector = new builder.ChatConnector();

server.post('/api/messages',connector.listen());

var bot = new builder.UniversalBot(connector,function(session){
    session.send("you said :" + session.message.text);
});
