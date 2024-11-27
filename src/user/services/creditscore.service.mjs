import axios from "axios";
import CreditScores from "../models/creditscore.model.mjs";
import { User } from "../models/user.model.mjs";
import * as ErrorHandler from "../../errorhandlers/errorHandler.mjs";

export const getCreditScore = async (bvn) => {
    try {
        const url = `${process.env.CREDIT_SCORE_BASE_URL}/credit/crc-fico`;
        const config = {
            headers: {
                token: `${process.env.CREDIT_SCORE_PUBLIC_KEY}`
            },
            params: {
                bvn : bvn
            }
        };

        const { data } = await axios.get(url, config);
        console.log(data, '===data')

        if (data?.status) {
            return data?.data;
        }
        return false;
    } catch (error) {
        console.log(error, '====error')
        ErrorHandler.axiosHandleErrorResponse(error)
    }
}

// getCreditScore("12345678901")

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
        rating: scoreObj?.score?.ficoScore?.rating ?? "",
        reasons: scoreObj?.score?.ficoScore?.reasons ?? "",
        last_fetched_at: new Date()
    }, {
        new: true,
        upsert: true
    })
    if (updatedScore) {
        updateScoreInUserProfile(updatedScore.user_id, updatedScore.ficoScore, updatedScore.rating);
        return updatedScore;
    }
}

export const updateScoreInUserProfile = async (user_id, score, rating) => {
    console.log(user_id, '===', score, "======", rating )
   const updated_user = await User.findByIdAndUpdate(user_id, {
        credit_score: score,
        credit_rating: rating
    }, {
        new : true
    });

    console.log(updated_user, '====updated_user')

}

export const updateScoreWithCron = (days = 30)=>{
    try {
        const last_fetched_at = new Date(new Date() - days * 24 * 60 * 60 * 1000);
        CreditScores.find({
            last_fetched_at : {
                $lt: last_fetched_at
            }
        }).then(score => {
            console.log(score);
        })
    } catch (error) {
        console.log(error, '====error')
    }
}