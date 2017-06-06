var restify = require('restify');
var builder = require('botbuilder');

var server = restify.createServer();
server.listen(3978,function(){
    console.log('%s listening to %s',server.name , server.url);
});

var connector = new builder.ChatConnector();
server.post('/api/messages',connector.listen());

var bot = new builder.UniversalBot(connector,[
    function(session){
        builder.Prompts.text(session, 'hello... whats your name');
    },
    function(session,results){
        var userName = results.response;
        session.userData.name = userName;
        builder.Prompts.number(session,'Hi,' + userName +' How many years have you been coding ?');
    },
    function(session,results){
        var experience = results.response;
        session.userData.coding = experience;
        builder.Prompts.choice(session ,'What language do you code Node using ?',
                                     ['JavaScript ','CoffeeScript','Node']);
    },
    function(session,results){
        var language = results.response.entity;
        session.userData.language = language;
        session.send('Got it ..' + session.userData.name + ' you have been programming for '
                                      + session.userData.coding +
                                    ' years and you use '+ session.userData.language +".");
    }
]);