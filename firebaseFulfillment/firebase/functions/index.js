const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { WebhookClient } = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:*'; // enables lib debugging statements
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });

  function handlerFunction(agent) {
    // Get parameter from Dialogflow with the string to add to the database
    // const databaseEntry = agent.parameters.databaseEntry;
    // Get the database collection 'dialogflow' and document 'agent' and store
    // the document  {entry: "<value of database entry>"} in the 'agent' document
    const dialogflowAgentRef = db.collection('users').doc('agent');
    return db.runTransaction(t => {
      console.log(agent.parameters.activity)
      t.update(dialogflowAgentRef, { message: 'test' });
      return Promise.resolve('Write complete');
    }).catch(err => {
      console.log(`Error writing to Firestore: ${err}`);
      agent.add(`Failed to write "${message}" to the Firestore database.`);
    });
  }

  // function readFromDb(agent) {
  //   // Get the database collection 'dialogflow' and document 'agent'
  //   const dialogflowAgentDoc = db.collection('dialogflow').doc('agent');

  //   // Get the value of 'entry' in the document and send it to the user
  //   return dialogflowAgentDoc.get()
  //     .then(doc => {
  //       if (!doc.exists) {
  //         agent.add('No data found in the database!');
  //       } else {
  //         agent.add(doc.data().entry);
  //       }
  //       return Promise.resolve('Read complete');
  //     }).catch(() => {
  //       agent.add('Error reading entry from the Firestore database.');
  //       agent.add('Please add a entry to the database first by saying, "Write <your phrase> to the database"');
  //     });
  // }

  // Map from Dialogflow intent names to functions to be run when the intent is matched
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', handlerFunction);
  intentMap.set('Default Fallback Intent', handlerFunction);
  intentMap.set('end of conversation', handlerFunction);
  intentMap.set('How are you', handlerFunction);
  intentMap.set('negative_response', handlerFunction);
  intentMap.set('negative_response - no', handlerFunction);
  intentMap.set('negative_response_no_wantstochat', handlerFunction);
  intentMap.set('negative_response_no_dontwanttochat', handlerFunction);
  intentMap.set('negative_response - yes', handlerFunction);
  intentMap.set('negative_response - yes_whatshappened', handlerFunction);
  intentMap.set('neutral_response', handlerFunction);
  intentMap.set('neutral_response - activities', handlerFunction);
  intentMap.set('neutral_response - activities - future', handlerFunction);
  intentMap.set('positive_response', handlerFunction);
  intentMap.set('positive_response_activities', handlerFunction);
  intentMap.set('positive_response_activities - future', handlerFunction);
  intentMap.set('negative_response_no_wantstochat_activities_future', handlerFunction);
  agent.handleRequest(intentMap);
});