const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Cloud Function: pushmelding bij nieuwe taak
exports.notifyNewTask = functions.firestore
    .document("tasks/{taskId}")
    .onCreate(async (snap, context) => {
      const task = snap.data();
      console.log("Nieuwe taak aangemaakt:", task.text);

      try {
      // Haal alle tokens op
        const tokensSnapshot = await admin.firestore().collection("tokens").get();

        if (tokensSnapshot.empty) {
          console.log("Geen tokens gevonden, melding wordt niet verstuurd.");
          return null;
        }

        const tokens = tokensSnapshot.docs.map((doc) => doc.data().token);

        // Bericht payload
        const payload = {
          notification: {
            title: "Nieuwe taak toegevoegd",
            body: task.text || "Er is een nieuwe taak aangemaakt.",
          },
        };

        // Pushmeldingen versturen
        const response = await admin.messaging().sendToDevice(tokens, payload);
        console.log("Push verstuurd:", response.successCount, "succesvol");
        return null;
      } catch (error) {
        console.error("Fout bij versturen push:", error);
        return null;
      }
    });
