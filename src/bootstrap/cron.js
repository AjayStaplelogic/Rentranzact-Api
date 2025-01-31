import cron from "node-cron";
import * as CreditScoreServices from "../user/services/creditscore.service.mjs";
import { sendRentReminderEmail } from "../user/services/property.service.mjs";
export default function () {

    /**
     * @description Cron will run every midnight
     */
    cron.schedule("0 0 * * *", () => {
        console.log(`[Cron executed successfully on ${new Date()}]`)
        // Perform your task here

        try {
            // Fetching and updating user credit score after 30 Days
            CreditScoreServices.updateScoreWithCron(30);
        } catch (error) {
            console.log(error)
        }
        try {
            sendRentReminderEmail()
        } catch (error) {
            console.log(error);
        }
    });
}