import activityLog from "../helpers/activityLog.mjs";
import { Roles } from "../models/role.model.mjs";

async function addRoleService(body) {

    const data = new Roles(body);

    data.save();

    
    await activityLog(admin._id , `created a new role ${data.name}`)

    return {
        data: data,
        message: `successfully fetched  list`,
        status: true,
        statusCode: 201,
    };
}

async function getRoleService() {


    const data = await Roles.find();

    return {
        data: data,
        message: `successfully fetched roles list`,
        status: true,
        statusCode: 201,
    };

}

async function deleteRoleService(id) {
    const data = await Roles.findByIdAndDelete(id);
    
    await activityLog(admin._id , `deleted a role ${data.name}`)
    return {
        data: data,
        message: `successfully fetched  list`,
        status: true,
        statusCode: 201,
    };
}

async function updateRoleService(id , permissions) {
    const data = await Roles.findByIdAndUpdate(id, {permissions : permissions});

    await activityLog(admin._id , `updated a ${data.name} role`)
    return {
        data: data,
        message: `successfully fetched  list`,
        status: true,
        statusCode: 201,
    };
}


export {
    addRoleService,
    getRoleService,
    deleteRoleService,
    updateRoleService
}