const functions = require('firebase-functions');
const { dialogflow } = require('actions-on-google');

const app = dialogflow();

app.intent('Default Welcome Intent', conv => {
  conv.ask('Hello, how are you feeling today?');
});

app.intent('Default Fallback Intent', conv => {
  conv.ask('Please could you repeat that?');
});

app.intent('Log User ID', conv => {
  conv.ask('Hello, how are you feeling today?');
});

app.intent('Log Mood', conv => {
  const mood = conv.parameters.Mood.toLowerCase();

  if (mood === 'positive') {
    conv.ask('Thats great, what have you been up to?');
  } else if (mood === 'neutral') {
    conv.ask('OK, what have you been up to?');
  } else if (mood === 'bad') {
    conv.ask('Sorry to hear that, what have you been up to?');
  }
});

app.intent('Log Activity', conv => {
  const userID =
    conv.body.queryResult.outputContexts[0].parameters['UserID.original'];
  const mood = conv.body.queryResult.outputContexts[0].parameters.Mood;
  const activity =
    conv.body.queryResult.outputContexts[0].parameters['Activities.original'];

  console.log(userID);
  console.log(mood);
  console.log(activity);

  if (mood === 'positive') {
    conv.ask("That's great! I'll add it to your diary!");
  } else if (mood === 'neutral') {
    conv.ask("OK, I'll make a note of that.");
  } else if (mood === 'negative') {
    conv.ask("I'm sorry to hear that, I will add it to your diary.");
  }
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
