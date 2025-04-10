import mongoose from "mongoose";

const Schema = mongoose.Schema;

const schema = new Schema({
    maintenance_request_id: {                                      // Refunds to
        type: mongoose.Types.ObjectId,
        ref: "maintenances",
        index: true
    },
    user_id: {                                      // Refunds to
        type: mongoose.Types.ObjectId,
        ref: "users",
        index: true
    },
    remark: {
        type: String
    },

}, {
    timestamps: true,
    toJSON: true,
    toObject: true,
});


const MaintenanceRemarks = mongoose.model('maintenance_remarks', schema);
export default MaintenanceRemarks;
