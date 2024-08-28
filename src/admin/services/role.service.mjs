import activityLog from "../helpers/activityLog.mjs";
import { Roles } from "../models/role.model.mjs";

async function addRoleService(body) {

    const data = new Roles(body);

    data.save();


    // await activityLog(admin._id, `created a new role ${data.name}`) // Commented because we don't have auth middleware for admin

    return {
        data: data,
        message: `successfully fetched  list`,
        status: true,
        statusCode: 201,
    };
}

async function getRoleService(body, req) {
    let pageNo = Number(req.query.pageNo || 1);
    let pageSize = Number(req.query.pageSize || 10);
    const skip = (pageNo - 1) * pageSize;
    let { search } = req.query;
    let query = {};
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
        ]
    }
    const data = await Roles.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize);;
    const count = await Roles.countDocuments(query);
    return {
        data: data,
        message: `successfully fetched roles list`,
        status: true,
        statusCode: 201,
        additionalData: { pageNo, pageSize, count }
    };

}

async function deleteRoleService(id) {
    const data = await Roles.findByIdAndDelete(id);

    // await activityLog(admin._id, `deleted a role ${data.name}`)  // Commented because we don't have auth middleware for admin
    return {
        data: data,
        message: `successfully fetched  list`,
        status: true,
        statusCode: 201,
    };
}

async function updateRoleService(id, permissions) {
    const data = await Roles.findByIdAndUpdate(id, { permissions: permissions });

    // await activityLog(admin._id, `updated a ${data.name} role`)  // Commented because we don't have auth middleware for admin
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