var builder = require('botbuilder');
var restify = require('restify');
var companyData = require('./companyData.json');

var server = restify.createServer();
server.listen(3978,function(){
   console.log("%s listening to %s", server.name , server.url);
});

var connector = new builder.ChatConnector();
server.post('/api/messages',connector.listen());

var bot = new builder.UniversalBot(connector,function(session){
     session.beginDialog('helpDialog');
});

var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/546db944-7398-4034-bb26-75864bb08a35?subscription-key=9caa1af898244e3ebf5ae81955aaf41d&verbose=true&timezoneOffset=0&q=';
bot.recognizer(new builder.LuisRecognizer(model));

bot.dialog('helpDialog',function(session){
    session.endDialog('help message');
}).triggerAction({matches : 'Help'});

bot.dialog('acquisitionDialog',function(session,args){
    var entities = args.intent.entities;

    //call common answer dialog
    session.beginDialog('answerDialog',{
        company : builder.EntityRecognizer.findEntity(entities,'CompanyName'),
        field: 'acquisitions',
        template:'answerAcquisitions'
    });

}).triggerAction({matches :'Acquisitions'});

//Answer IPO related Questions
bot.dialog('ipoDateDialog',function(session,args){
       var entities = args.intent.entities;
       session.beginDialog('answerDialog',{
           company : builder.EntityRecognizer.findEntity(entities,'CompanyName'),
           field:'ipoDate',
           template:'answerIpoDate'
       });
}).triggerAction({matches : 'IpoDate'});

// Answer head quarter information
bot.dialog('headquartersDialog',function(session,args){
    var entities = args.intent.entities;
    session.beginDialog('answerDialog',{
        company: builder.EntityRecognizer.findEntity(entities,'CompanyName'),
        field:'headquarters',
        template:'answerHeadquarters'
    });
}).triggerAction({matches:'Headquarters'});

//answer description related questions like tell me about microsoft
bot.dialog('descriptionDialog',function(session,args){
      var entities = args.intent.entities;
      session.beginDialog('answerDialog',{
          company : builder.EntityRecognizer.findEntity(entities,'CompanyName'),
          field:'description',
          template:'answerDescription'
      });
}).triggerAction({matches: 'Description'});

//answer founder related questions like "who started microsoft"
bot.dialog('foundersDialog',function(session,args){
    var entities = args.intent.entities;
    session.beginDialog('answerDialog',{
        company:builder.EntityRecognizer.findEntity(entities,'CompanyName'),
        field:'founders',
        template:'answerFounders'
    });
}).triggerAction({matches:'Founders'});

// common answer dialog. it expects following
// {
          //field:string
          //template:string
          //company:IEntity
 //}
bot.dialog('answerDialog',[
    function askCompany(session,args,next){
        session.dialogData.args = args;

        var company,isValid;
        if(args.company){
            company = args.company.entity.toLowerCase();
            isValid = companyData.hasOwnProperty(company);
        }else if(session.privateConversationData.company){
            company = session.privateConversationData.company;
            isValid = true;
        }

        //prompt user to pick a company if not valid
        if(!isValid){
            var txt = args.company ? session.gettext('companyUnknown', {company : args.company}) : 'CompanyMissing';
            builder.Prompts.choice(session,txt,companyData);
        }else{
            next({response:{entity:company}});
        }
    },
    function answerQuestion(session,results){
        var args = session.dialogData.args;
        var company = session.privateConversationData.company = results.response.entity;

        var answer = {company: company, value:companyData[company][args.field]};
        session.endDialog('here is the answer' +answer);
    }
]).cancelAction('cancelAnswer','cancelMessage',{matches : /^cancel/i});
