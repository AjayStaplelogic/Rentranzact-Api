import admin from "../../server.js";
async function sendNotification(user, type, title, body, metadata, role) {
  try {
    console.log(body, "----body in sendNotification")
    const message = {
      notification: {
        title: title.toString(),
        body: body.toString()
      },
      data: metadata,
      token: user?.fcmToken
    };

    console.log(user.fcmToken, " ===============fcm token")


    if (type === "single") {

      admin.messaging().subscribeToTopic(message.token, role)
        .then((response) => {
          console.log("=====subscribe to topic", response)
        })
        .catch((error) => {
          console.log('error -----------------------', error)
        });


      admin.messaging().send(message)
        .then((response) => {
          console.log('Notification sent:', response);
        })
        .catch((error) => {
          console.error('Error sending notification:', error);
        });
    } else if (type === "multiple") {

      admin.messaging().sendEachForMulticast(message).then((respsone) => console.log("sent messages")).catch((error) => console.log("failed message"))

    }

  } catch (error) {
    console.log(error)
  }
}
export default sendNotification;

