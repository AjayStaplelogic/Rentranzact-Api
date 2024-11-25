export const twawToWebhook = (req, res) => {
    try {
        console.log(req.headers, '====req.headers')
        console.log(req.body, '====req.body')
        console.log(req.query, '====req.query')
    } catch (error) {
        console.error("Error while converting Twitch API data to Slack webhook payload:", error);
        return null;
    }
}