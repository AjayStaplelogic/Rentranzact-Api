import admin from "../../server.js";
async function sendNotification(user, type, title, body, metadata, role) {

  const message = {
    topic : role,
    notification: {
      title: title.toString(),
      body: body.toString()
    },
    data: metadata,
    token : user?.fcmToken
  };

  if (type === "single") {
    admin.messaging().send(message)
      .then((response) => {
        // console.log('Notification sent:', response);
      })
      .catch((error) => {
        // console.error('Error sending notification:', error);
      });
  } else if (type === "multiple") {

    admin.messaging().sendEachForMulticast(message).then((respsone) => console.log("sent messages")).catch((error) => console.log("failed message"))

  }

}
export default sendNotification;

