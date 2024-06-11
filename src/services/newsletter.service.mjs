import { newsletter } from "../models/newsletter.model.mjs";

async function subscribeNewsletter(body) {
  const checkSubscriber = await newsletter.findOne({ email: body?.email });

  if (checkSubscriber) {
    return {
      data: [],
      message: "you already subscribed to newsletter",
      status: false,
      statusCode: 401,
    };
  } else {
    const subscriber = new newsletter(body);

    await subscriber.save();

    return {
      data: subscriber,
      message: "subscribed successfully",
      status: true,
      statusCode: 201,
    };
  }
}

export { subscribeNewsletter };
