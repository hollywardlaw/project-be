const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { dialogflow } = require('actions-on-google');

process.env.DEBUG = 'dialogflow:*';
admin.initializeApp();
const db = admin.firestore();
const app = dialogflow();

const currentDate = new Date();
let day = currentDate.getDate();
day = '0' + day;
day = day.slice(-2);
let month = currentDate.getMonth() + 1;
month = '0' + month;
month = month.slice(-2);
const year = currentDate.getFullYear();

const date = year + '-' + month + '-' + day;

app.intent('Default Welcome Intent', agent => {
  agent.ask('Hello, how are you feeling today?');
});

app.intent('Default Fallback Intent', agent => {
  agent.ask('Please could you repeat that?');
});

app.intent('Log ID', agent => {
  const user = agent.parameters.userid;

  const dialogflowAgentRef = db.collection('users').doc(user);

  return dialogflowAgentRef.get().then(snapshot => {
    const data = snapshot.data();
    const name = data.name;
    return agent.ask(`Hello, ${name}, how are you today? 🙂`);
  });
});

app.intent('Log Mood', agent => {
  const mood = agent.parameters.mood;

  let user = agent.body.queryResult.outputContexts[0].parameters.userid;

  if (mood === 'positive') {
    agent.ask("That's great! What have you been up to? 😄");
  } else if (mood === 'negative') {
    agent.ask('Sorry to hear that, what have you been up to?');
  } else if (mood === 'imposter') {
    const dialogflowAgentRef = db
      .collection('users')
      .doc(user)
      .collection('history');

    return dialogflowAgentRef.get().then(snapshot => {
      let achievements = '';

      snapshot.forEach(doc => {
        achievements += doc.data().achievement + ', ';
      });

      return agent.ask(
        "Why don't you take a look through some previous entries you feel proud of? " +
          achievements.slice(0, achievements.length - 2) +
          '. 🙂'
      );
    });
  } else if (mood === 'alert') {
    agent.ask(
      'Samaritans are available to listen, 24 hours a day, on 116 123.'
    );
  } else {
    agent.ask('What have you been up to?');
  }

  if (mood === 'positive' || mood === 'negative' || mood === 'neutral') {
    const dialogflowAgentRef = db
      .collection('users')
      .doc(user)
      .collection('history')
      .doc(date);

    return dialogflowAgentRef.update({ mood }).then(() => {});
  }
});

app.intent('Log Activity', agent => {
  let activity = agent.query;

  if (agent.parameters.activities) activity = agent.parameters.activities;

  let user = agent.body.queryResult.outputContexts[0].parameters.userid;
  let mood = agent.body.queryResult.outputContexts[0].parameters.mood;

  if (mood === 'positive') {
    agent.ask("That's great, I'll add that to your diary!");
  } else if (mood === 'negative') {
    agent.ask('Sorry to hear that.');
  } else {
    agent.ask("I'll make a note of that.");
  }

  const dialogflowAgentRef = db
    .collection('users')
    .doc(user)
    .collection('history')
    .doc(date);

  return dialogflowAgentRef.update({ activity });
});

app.intent('Log Achievement', agent => {
  agent.ask("That's great! What do you feel proud of?");
});

app.intent('Confirm Achievement', agent => {
  let user = agent.body.queryResult.outputContexts[1].parameters.userid;
  let achievement = agent.query;

  agent.ask("Congratulations! I've added that to your diary!");

  const dialogflowAgentRef = db
    .collection('users')
    .doc(user)
    .collection('history')
    .doc(date);

  return dialogflowAgentRef.update({ achievement });
});

app.intent('End of Conversation', agent => {
  const mood = agent.body.queryResult.outputContexts[0].parameters.mood;

  if (mood === 'positive') {
    const responses = [
      'Thanks for checking in, speak to you soon!',
      'Bye, thanks for checking in!'
    ];
    agent.ask(responses[Math.floor(Math.random() * responses.length)]);
  } else if (mood === 'negative') {
    const responses = [
      'Good bye, I’m at the bottom of the page if you want to chat.',
      'You know where I am if you want to chat.'
    ];
    agent.ask(responses[Math.floor(Math.random() * responses.length)]);
  } else {
    agent.ask('Speak to you soon, take care.');
  }
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
