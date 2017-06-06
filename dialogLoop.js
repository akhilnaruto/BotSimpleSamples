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
        session.send('Thanks %(name)s. you are %(age)s and located in %(state)s.' , results.response);
    }
]);

//Add Q&A dialog

bot.dialog('q&aDialog',[
    function(session,args){
        session.dialogData.index = args ? args.index : 0;
        session.dialogData.form = args ? args.form : {};

        builder.Prompts.text(session,questions[session.dialogData.index].prompt);
    },
    function(session,results){
        var field = questions[session.dialogData.index++].field;
        session.dialogData.form[field] = results.response;

        if(session.dialogData.index >= questions.length){
            session.endDialogWithResult({response:session.dialogData.form});
        }else{
            session.replaceDialog('q&aDialog',session.dialogData);
        }
    }
]);


var questions = [
    {field:'name' , prompt :'What is your name ?'},
    {field:'age' , prompt:'What is your age ?'},
    {field:'state', prompt:'What state are you in?'}
]
