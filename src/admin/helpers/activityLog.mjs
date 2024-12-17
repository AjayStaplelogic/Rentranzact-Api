import { Activity } from "../models/activity.model.mjs";

async function activityLog(empID, body) {

    const data = new Activity({ empID, body });

    data.save()
}

export default activityLog;

