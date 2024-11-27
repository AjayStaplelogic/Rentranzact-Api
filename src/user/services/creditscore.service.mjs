import axios from "axios";
import CreditScores from "../models/creditscore.model.mjs";
import { User } from "../models/user.model.mjs";
import * as ErrorHandler from "../../errorhandlers/errorHandler.mjs";

/**
 * @description To Fetch credit score using check credit score API
 * @param {string} bvn bvn number of user to get data based on
 * @returns {object} object containing information about the credit score from check credit score API
 */
export const getCreditScore = async (bvn) => {
    try {
        const url = `${process.env.CREDIT_SCORE_BASE_URL}/credit/crc-fico`;
        const config = {
            headers: {
                token: `${process.env.CREDIT_SCORE_PUBLIC_KEY}`
            },
            params: {
                bvn: bvn
            }
        };

        const { data } = await axios.get(url, config);
        if (data?.status) {
            return data?.data;
        }
        return false;
    } catch (error) {
        ErrorHandler.axiosHandleErrorResponse(error)
    }
}

/**
 * @description Create and update credit score data in DB and also update in user profile
 * @param {string} user_id valid user id from DB
 * @param {object} scoreObj Object/data returned from credit score check API
 * @returns {CreditScores} Credit score Object from DB
 */
export const addUpdateScore = async (user_id, scoreObj) => {
    const updatedScore = await CreditScores.findOneAndUpdate({
        user_id: user_id,
    }, {
        user_id: user_id,
        bvn: scoreObj?.bvn ?? "",
        name: scoreObj?.name ?? "",
        phone: scoreObj?.phone ?? "",
        gender: scoreObj?.gender ?? "",
        dateOfBirth: scoreObj?.dateOfBirth ?? "",
        address: scoreObj?.address ?? "",
        email: scoreObj?.email ?? "",
        hasLoans: scoreObj?.score?.hasLoans ?? "",
        ficoScore: scoreObj?.score?.ficoScore?.score,
        total_delinquent_facilities: scoreObj?.score?.totalNoOfDelinquentFacilities,
        rating: scoreObj?.score?.ficoScore?.rating ?? "",
        reasons: scoreObj?.score?.ficoScore?.reasons ?? "",
        last_fetched_at: new Date()
    }, {
        new: true,
        upsert: true
    })
    if (updatedScore) {
        updateScoreInUserProfile(updatedScore.user_id, updatedScore.ficoScore, updatedScore.rating, updatedScore.reasons);
        return updatedScore;
    }
}

/**
 * @description Updates the score and rating in user profile
 * @param {string} user_id Valid if of user from db
 * @param {number} score returned by the credit score API
 * @param {string} rating returned by the credit score API
 * @param {string} reasons returned by the credit score API 
 * @returns {void} Nothing
 */
export const updateScoreInUserProfile = async (user_id, score, rating, reasons) => {
    User.findByIdAndUpdate(user_id, {
        credit_score: score,
        credit_rating: rating,
        // reasons: reasons,
        credit_score_fetched_at: new Date()
    }, {
        new: true
    }).then((data) => {

    });
}

/**
 * @description To update the credit score when cron runs, checking if last updated data is 30 days before
 * @param {number} days, Days to check for last updated
 * @returns {void} nothing
 */
export const updateScoreWithCron = (days = 30) => {
    const last_fetched_at = new Date(new Date() - days * 24 * 60 * 60 * 1000);
    CreditScores.find({
        last_fetched_at: {
            $lt: last_fetched_at
        }
    }).then(score => {
        if (score?.length > 0) {
            score.forEach(async (sc) => {
                const creditScore = await getCreditScore(sc.bvn);
                if (creditScore) {
                    addUpdateScore(sc.user_id, creditScore);
                }
            });
        }
    })
}