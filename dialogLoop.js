var builder = require('botbuilder');
var restify = require('restify');

var server = restify.createServer();
server.listen(3978,function(){
    console.log('% listening to %s' , server.name , server.url);
});

var connector = new builder.ChatConnector();
server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector,[
    function(session){
        session.beginDialog('q&aDialog');
    },
    function(session , results){
        session.send('Thanks %(name)s.. you are %(age)s and located in %(state)s.' , results.response);
    }
]);

//Add Q&A dialog


var questions = [
    {field:'name' , prompt :'What is your name ?'},
    {field:'age' , prompt:'What is your age ?'},
    {field:'state', prompt:'What state are you in?'}
]
