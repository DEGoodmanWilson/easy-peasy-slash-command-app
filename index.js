/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ______    ______    ______   __  __    __    ______
 /\  == \  /\  __ \  /\__  _\ /\ \/ /   /\ \  /\__  _\
 \ \  __<  \ \ \/\ \ \/_/\ \/ \ \  _"-. \ \ \ \/_/\ \/
 \ \_____\ \ \_____\   \ \_\  \ \_\ \_\ \ \_\   \ \_\
 \/_____/  \/_____/    \/_/   \/_/\/_/  \/_/    \/_/


 This is a sample Slack Button application that provides a custom
 Slash command.

 This bot demonstrates many of the core features of Botkit:

 *
 * Authenticate users with Slack using OAuth
 * Receive messages using the slash_command event
 * Reply to Slash command both publicly and privately

 # RUN THE BOT:

 Create a Slack app. Make sure to configure at least one Slash command!

 -> https://api.slack.com/applications/new

 Run your bot from the command line:

 clientId=<my client id> clientSecret=<my client secret> PORT=3000 node bot.js

 Note: you can test your oauth authentication locally, but to use Slash commands
 in Slack, the app must be hosted at a publicly reachable IP or host.


 # EXTEND THE BOT:

 Botkit is has many features for building cool and useful bots!

 Read all about it here:

 -> http://howdy.ai/botkit

 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

/* Uses the slack button feature to offer a real time bot to multiple teams */
var Botkit = require('botkit');

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.PORT || !process.env.VERIFICATION_TOKEN) {
    console.log('Error: Specify CLIENT_ID, CLIENT_SECRET, VERIFICATION_TOKEN and PORT in environment');
    process.exit(1);
}

var config = {}
if (process.env.MONGOLAB_URI) {
    var BotkitStorage = require('botkit-storage-mongo');
    config = {
        storage: BotkitStorage({mongoUri: process.env.MONGOLAB_URI}),
    };
} else {
    config = {
        json_file_store: './db_slackbutton_slash_command/',
    };
}

var controller = Botkit.slackbot(config).configureSlackApp(
    {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        scopes: ['commands'],
    }
);

controller.setupWebserver(process.env.PORT, function (err, webserver) {
    controller.createWebhookEndpoints(controller.webserver);

    controller.createOauthEndpoints(controller.webserver, function (err, req, res) {
        if (err) {
            res.status(500).send('ERROR: ' + err);
        } else {
            res.send('Success!');
        }
    });
});


//
// BEGIN EDITING HERE!
//

controller.on('slash_command', function (slashCommand, message) {

    switch (message.command) {

        var chickenKatsuCount = 0;
        var katsuCurryCount = 0;
        var toriYakisobaCount = 0;
        var nambanToriCount = 0;
        var ramenCount = 0;

        case "/isitnobitime": //handle the `/echo` slash command. We might have others assigned to this app too!
            // The rules are simple: If there is no text following the command, treat it as though they had requested "help"
            // Otherwise just echo back to them what they sent us.

            // TOKEN VERIFICATION
            if (message.token !== process.env.VERIFICATION_TOKEN) return; //just ignore it.

            // HELP COMMAND
            if (message.text === "" || message.text === "help") {
                slashCommand.replyPrivate(message,
                    "🔑 Hey, je suis le Nobi Nobi bot ! Grâce à moi, tu peux commander ton plat directement depuis Slack." +
                    "Tu as juste à tapper ceci : `/isitnobitime chicken katsu` pour commander un Chicken Katsu. Ça marche aussi avec les autres plats." +
                    "Quelques commandes utiles :" +
                    "- 🔑 `/isitnobitime help` pour afficher l'aide" +
                    "- ❌ `/isitnobitime cancel` pour annuler ta dernière commande" +
                    "- 📋 `/isitnobitime menu` pour afficher la liste des plats à commander" +
                    "- 📲 `/isitnobitime order` lorsque tu es prêt à commander !" +
                    "- ⏰ `/isitnobitime resetlist` pour annuler TOUTE la commande.");
                return;
            }

            // FOOD ADD
            if (message.text === "chicken katsu") {
                slashCommand.replyPrivate(message, "Chicken Katsu bien ajouté à la commande !");
                chickenKatsuCount += 1;
                return;
            }

            // CANCEL COMMAND
            if (message.text === "cancel") {
                slashCommand.replyPrivate(message, "❌ Pas de panique, ton dernier plat ajouté à été annulé :)");
                return;
            }

            // LIST COMMAND
            if (message.text === "menu") {
                slashCommand.replyPrivate(message, "📋 Voici la liste des plats du Nobi (pour en savoir plus : http://nobi.com) :");
            }

            // ORDER COMMAND
            if (message.text === "order") {
                slashCommand.replyPrivate(message, "📲 C'est parti ? Voici ce qu'il faut commander :" +
              "- " + chickenKatsuCount + " Chicken Katsu" +
              "- " + katsuCurryCount + " Katsu Curry" +
              "- " + toriYakisobaCount + " Tori Yakisoba" +
              "- " + nambanToriCount + " Namban Tori" +
              "- " + ramenCount + " Ramen" +
              "—————" +
              "SMS au 05 05 05 05 05" +
              "Appel au 05 05 05 05 05");
            }

            if (message.text === "resetlist") {
                slashCommand.replyPrivate(message, "⏰ On remet à zéro : toute la liste a bien été annulée !");
            }

            break;

        case ""
        default:
            slashCommand.replyPublic(message, "Désolé, je ne connais pas cette commande. Si tu as besoin d'un coup de main, essaye de tapper `/isitnobitime help` !");


        // RESET TIMER EVERY MONDAY
        var date = new Date();
        var resetDay = date.getDay();
        var resetHour = date.getHours();

        if (resetDay === 0 && resetHour === 10) {
          var chickenKatsuCount = 0;
          var katsuCurryCount = 0;
          var toriYakisobaCount = 0;
          var nambanToriCount = 0;
          var ramenCount = 0;

          slashCommand.replyPublic(message, "Nouvelle semaine, nouveau Nobi : la commande a été réinitialisée !");
        }

    }

})
;
