import cron from "node-cron";
import * as CreditScoreServices from "../user/services/creditscore.service.mjs";

export default function () {

    /**
     * @description Cron will run every midnight
     */
    cron.schedule("0 0 * * *", () => {
        console.log("Every minute");
        // Perform your task here

        // Fetching and updating user credit score after 30 Days
        CreditScoreServices.updateScoreWithCron(30);
    });
}