var restify = require('restify');
var builder = require('botbuilder');

var server = restify.createServer();
server.listen(3978,function(){
    console.log('%s listening to %s', server.name , server.url);
});

var connector = new builder.ChatConnector();
server.post('/api/messages',connector.listen());

var bot = new builder.UniversalBot(connector,[
    function(session){
        session.send('Hello.. i am decision bot.');
        session.beginDialog('rootMenu');
    },
    function(session,results){
        session.endDialog('Goodbye until next time..');
    }
]);

bot.dialog('rootMenu',[
    function(session){
        builder.Prompts.choice(session,"Choose an Option: ",'Flip A Coin|Roll Dice|Magic 8-Ball|Quit');
    },
    function(session,results){
        switch(results.response.index){
            case 0:
                session.beginDialog('flipCoinDialog');
                break;
            case 1:
                session.beginDialog('rollDiceDialog');
                break;
            case 2:
                session.beginDialog('magicBallDialog');
                break;
            default:
                session.endDialog();
                break;
        }
    },
    function(session){
        session.replaceDialog('rootMenu');
    }
]).reloadAction('showMenu',null,{ matches: /^(menu|back)/i });

bot.dialog('flipCoinDialog',[
    function(session,args){
        builder.Prompts.choice(session, "Choose heads or tails.", "heads|tails", { listStyle: builder.ListStyle.none })
    },
    function(session,results){
        var flip = Math.random() > 0.5 ? 'heads' : 'tails';
        if(flip === results.response.entity){
            session.endDialog('its %s , YOU WIN' , flip);
        }
        else{
            session.endDialog('Sorry.. it was %s . you lost :(' , flip);
        }
    }
]);

bot.dialog('rollDiceDialog',[
    function(session,args){
        builder.Prompts.number(session, 'How many dice should i roll ?');
    },
    function(session,results){
        if(results.response > 0){
            var message = 'I rolled :';
            for(var i=0 ; i < results.response ; i++){
                var roll = Math.floor(Math.random() * 6) + 1;
                msg += ' ' +roll.toString(); 
            }
            session.endDialog(msg);
        } else{
            session.endDialog('Ummm...kk.. I rolled air.');
        }
    }
]);

bot.dialog('magicBallDialog',[
     function(session,args){
         builder.Prompts.text(session,"What is your question ?");
     },
     function(session,result){
         session.endDialog('Here is the magic answer');
     }
]);