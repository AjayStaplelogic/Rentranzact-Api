export const twawToWebhook = (req, res) => {
    try {

        console.log(req.headers, '====req.headers')
        console.log(req.body, '====req.body')
        console.log(req.query, '====req.query')
        global.io.broadcast.emit('news', { hello: 'world Testing socket' });
       const io = req.app.get('io');
       io.broadcast.emit('attachedmanual', { hello: 'world Testing socket' });

    } catch (error) {
        console.error("Error while converting Twitch API data to Slack webhook payload:", error);
        return null;
    }
}