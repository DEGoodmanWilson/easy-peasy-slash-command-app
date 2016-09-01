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

function loadMeals(callback) {
    var fs = require('fs');
    var obj = JSON.parse(fs.readFileSync('meals.json', 'utf8'));
    return obj;
}

function mealDescription(meal) {
    var desc = "- " + "*" + meal.name + "*";
    desc += " (" + meal.img + ")" + "\n";
    desc += meal.desc + "\n";
    return desc;
}

function getMealFromName(meals, mealName) {
    for (var i = 0; i < meals.length; i++) {
        if (meals[i].name.toLowerCase() == mealName.toLowerCase()) {
            return meals[i];
        }
    }
    return undefined;
}

function startBot(meals) {
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
            storage: BotkitStorage({
                mongoUri: process.env.MONGOLAB_URI
            }),
        };
    } else {
        config = {
            json_file_store: './db_slackbutton_slash_command/',
        };
    }

    var controller = Botkit.slackbot(config).configureSlackApp({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        scopes: ['commands'],
    });

    controller.setupWebserver(process.env.PORT, function(err, webserver) {
        controller.createWebhookEndpoints(controller.webserver);

        controller.createOauthEndpoints(controller.webserver, function(err, req, res) {
            if (err) {
                res.status(500).send('ERROR: ' + err);
            } else {
                res.send('Success!');
            }
        });
    });

    controller.on('slash_command', function(slashCommand, message) {

        switch (message.command) {

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
                if (message.text.startsWith("add ")) {
                    handleAddFoodCommand(message, slashCommand, meals);
                    return;
                }

                // CANCEL COMMAND
                if (message.text === "cancel") {
                    slashCommand.replyPrivate(message, "❌ Pas de panique, ton dernier plat ajouté à été annulé :)");
                    return;
                }

                // LIST COMMAND
                if (message.text === "menu") {
                    handleMenuCommand(message, slashCommand, meals);
                    return;
                }

                // ORDER COMMAND
                if (message.text === "order") {
                    slashCommand.replyPrivate(message, "📲 C'est parti ? Voici ce qu'il faut commander :" +
                        "- " + 0 + " Chicken Katsu" +
                        "- " + 0 + " Katsu Curry" +
                        "- " + 0 + " Tori Yakisoba" +
                        "- " + 0 + " Namban Tori" +
                        "- " + 0 + " Ramen" +
                        "—————" +
                        "SMS au 05 05 05 05 05" +
                        "Appel au 05 05 05 05 05");
                    return;
                }

                if (message.text === "resetlist") {
                    slashCommand.replyPrivate(message, "⏰ On remet à zéro : toute la liste a bien été annulée !");
                    return;
                }

                // Nothing matched
                slashCommand.replyPrivate(message, "Désolé, je ne connais pas cette commande. Si tu as besoin d'un coup de main, essaye de tapper `/isitnobitime help` !");

                break;

            default:
                slashCommand.replyPrivate(message, "Désolé, je ne connais pas cette commande. Si tu as besoin d'un coup de main, essaye de tapper `/isitnobitime help` !");


                // RESET TIMER EVERY MONDAY
                var date = new Date();
                var resetDay = date.getDay();
                var resetHour = date.getHours();

                if (resetDay === 0 && resetHour === 10) {
                    slashCommand.replyPublic(message, "Nouvelle semaine, nouveau Nobi : la commande a été réinitialisée !");
                }

        }

    });

    function handleAddFoodCommand(message, command, meals) {
        var mealName = message.text.substr("add ".length); // "add chicken katsu" -> "chicken katsu"
        var meal = getMealFromName(meals, mealName);
        var user = message.user_name;
        if (meal == undefined) {
            command.replyPrivate(message, "Ce plat n'existe pas... `/isitnobitime menu` devrait pouvoir t'aider");
        } else {
            // TODO: Save the receipent name and the meal
            command.replyPrivate(message, "Noté ! Un " + meal.name + " a été ajouté pour " + user);
        }
    }

    function handleMenuCommand(message, command, meals) {
        var text = "📋 Voici la liste des plats du Nobi (pour en savoir plus : http://nobi.com) :\n\n";
        for (var i = 0; i < meals.length; i++) {
            text += mealDescription(meals[i]) + "\n\n";
        }
        command.replyPrivate(message, text);
    }

}

var meals = loadMeals();
startBot(meals);
