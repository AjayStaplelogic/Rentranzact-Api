import { sendResponse } from "../helpers/sendResponse.mjs";
import * as  bankAccountValidations from "../validations/bankAccount.validation.mjs";
import { validator } from "../helpers/schema-validator.mjs";
import { verifyBankAccountWithFlutterwave } from "../services/flutterwave.service.mjs";
import BankAccounts from "../models/bankAccounts.model.mjs";
import { EBankAccountStatus } from "../enums/bankAccounts.enum.mjs";
import * as cryptoServices from "../../helpers/crypto.mjs";

export const verifyAndUpdateBankAccount = async (req, res) => {
    try {
        const { isError, errors } = validator(req.body, bankAccountValidations.verifyAndUpdateBankAccount);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 403);
        }

        const account = await verifyBankAccountWithFlutterwave(req.body.account_bank, req.body.account_number);
        if (account) {
            const create_account = await BankAccounts.findOneAndUpdate(
                {
                    user_id: req.user.data._id,
                },
                {
                    user_id: req.user.data._id,
                    account_holder_name: account.account_name,
                    account_number: cryptoServices.encryptionForFrontend(account.account_number),
                    account_bank: req.body.account_bank,
                    status: EBankAccountStatus.verified,
                },
                {
                    new: true,
                    upsert: true
                }
            );
            if (create_account) {
                return sendResponse(res, create_account, "success", true, 200);
            }
            throw "Server Errror"
        }
        throw "Invalid account details"
    } catch (error) {
        return sendResponse(res, null, `${error}`, false, 400);
    }
}

export const getBankAccount = async (req, res) => {
    try {
        const get_account = await BankAccounts.findOne({
            user_id: req.user.data._id,
            isDeleted: false
        });

        return sendResponse(res, get_account, "success", true, 200);
    } catch (error) {
        return sendResponse(res, null, `${error}`, false, 400);
    }
}
