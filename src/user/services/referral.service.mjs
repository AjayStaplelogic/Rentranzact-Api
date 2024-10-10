import { User } from "../models/user.model.mjs";
import ReferralEarnings from "../models/referralEarnings.model.mjs";
import { v4 as uuidv4 } from 'uuid';
import moment from "moment";
import { ETRANSACTION_TYPE } from "../enums/common.mjs";
import { UserRoles } from "../enums/role.enums.mjs";
import { Transaction } from "../models/transactions.model.mjs";
import { EBonusPer } from "../enums/referral.enum.mjs"
import { EPaymentType } from "../enums/wallet.enum.mjs";
import { Wallet } from "../models/wallet.model.mjs";

/**
 * @description Returns the random string of requested strLength, by default it will return code of length 8
 * @param {number} strLength, Length of the code to be returned
 * @returns {string} Returns the string representation of the code length in characters
 */
export const generateRandomString = (strLength = 8) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < strLength; i++) {
        code += characters[Math.floor(Math.random() * characters.length)];
    }
    return code;
}

/**
 * @description Checks whether the given code already assigned to any user or not
 * @param {string} referralCode Code to check for myCode in users model
 * @returns {boolean} True if the code is in the user model and false otherwise
 */
export const isMyCodeExistsInUsers = async (referralCode) => {
    const isExists = await User.findOne({ myCode: referralCode });
    return isExists ? true : false;
}

/**
 * @description Returns unqiue mycode after checking if it exists in the users model.
 * @param {number} codeLength The length of the code to retrieve
 * @returns {string} Returns the string representation of the code length
 */
export const generateMyCode = async (codeLength = 8) => {
    let myCode = generateRandomString(codeLength);
    while (await isMyCodeExistsInUsers(myCode)) {
        myCode = generateRandomString(codeLength);
    }
    return myCode;
}

/**
 * @description Retrieves user details based on the given myCode
 * @param {string} referralCode The myCode of the user
 * @returns {User} Returns the user document if found, otherwise returns null
 */
export const getUserByMyCode = async (referralCode) => {
    return await User.findOne({ myCode: referralCode });
}

/**
 * @description This function will add referral bonus in wallet, create entry in referral earnings and transaction model only for first time
 * @param {number} amount Total referral bonus amount to transfer in wallet
 * @param {string} from  Id of the referred to user
 * @param {string} to  Id of the referred by user
 * @param {string} property_id Property id whose rent is paid
 */
export const addReferralBonusInWallet = async (amount, from, to, property_id = null) => {
    try {
    const benificiaryDetails = await User.findById(to).lean().exec();
    if (benificiaryDetails) {
        const already_added = await ReferralEarnings.findOne({
            from: from,
            to: to,
            isDeleted: false
        });

        if (!already_added) {
            let referral_earning_payload = {
                from: from,
                to: to,
                amount: amount,
                isDeleted: false,
                property_id
            };

            const new_referral_earnings = new ReferralEarnings(referral_earning_payload);
            const created = moment().unix();
           
            const wallet_payload = {
                amount: Number(amount),
                status: "successful",
                type: "CREDIT",
                userID: to,
                intentID: uuidv4(),
                payment_type: EPaymentType.rechargeWallet,
                createdAt : created
            }

            const add_wallet = new Wallet(wallet_payload);
            console.log(add_wallet, '====add_wallet')


            const transaction_payload = {
                wallet: true,
                amount: amount,
                status: "successful",
                date: created,
                intentID: uuidv4(),
                type: "CREDIT",
                transaction_type: ETRANSACTION_TYPE.referralBonus
            };
            
            
            if (UserRoles.LANDLORD === benificiaryDetails?.role) {
                transaction_payload.landlordID = benificiaryDetails._id;
            } else if (UserRoles.PROPERTY_MANAGER === benificiaryDetails?.role) {
                transaction_payload.pmID = benificiaryDetails._id;
            } else if (UserRoles.RENTER === benificiaryDetails?.role) {
                transaction_payload.renterID = benificiaryDetails._id;
            }
            console.log(transaction_payload, '====transaction_payload')
            
            const create_transaction = new Transaction(transaction_payload);
            new_referral_earnings.save();
            add_wallet.save();
            console.log(add_wallet, '====add_wallet  222')

            create_transaction.save();
            console.log(create_transaction, '====create_transaction  222')

        }
    }
} catch (error) {
    console.log(error, '====error from bonus to wallet')       
}

}

export const calculateReferralAmountWithRTZFee = (rtz_fee = 0) => {
    return Number((rtz_fee * EBonusPer.referrer) / 100) || 0;
}