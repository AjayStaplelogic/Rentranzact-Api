import { Roles } from "../models/role.model.mjs";

async function addRoleService(body) {

    const data = new Roles(body);

    data.save()

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
    return {
        data: data,
        message: `successfully fetched  list`,
        status: true,
        statusCode: 201,
    };
}

async function updateRoleService(id , permissions) {
    const data = await Roles.findByIdAndUpdate(id, {permissions : permissions});
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