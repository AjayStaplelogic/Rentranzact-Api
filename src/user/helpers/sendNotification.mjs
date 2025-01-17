import admin from "../../server.js";
async function sendNotification(user, type, title, body, metadata, role) {
  try {
    const message = {
      notification: {
        title: title.toString(),
        body: body.toString()
      },
      data: metadata,
      token: user?.fcmToken
    };
    if (type === "single") {
      admin.messaging().subscribeToTopic(message.token, role)
        .then((response) => {
        })
        .catch((error) => {
        });


      admin.messaging().send(message)
        .then((response) => {
        })
        .catch((error) => {
        });
    } else if (type === "multiple") {
      admin.messaging().sendEachForMulticast(message).then((respsone) => console.log("sent messages")).catch((error) => console.log("failed message"))

    }

  } catch (error) {
  }
}
export default sendNotification;

