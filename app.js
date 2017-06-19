var restify = require('restify');
var builder = require('botbuilder');

var server = restify.createServer();
server.listen(3978,function(){
    console.log('%s listening to %s', server.name , server.url);
});

var connector = new  builder.ChatConnector({
        appId :'13d2b7b4-b4aa-4382-a5fe-dae4339fdd5b',
        appPassword : 'kx6naC1F3PwFakgPMAK4b4q',
        gzipData: true
    });

server.post('/api/messages',connector.listen());

var bot = new builder.UniversalBot(connector,function(session){
    session.send("you said :" + session.message.text);
});
