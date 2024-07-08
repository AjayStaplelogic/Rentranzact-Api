import express from 'express'
const router = express.Router();
import { login, signup, userVerification, socialLogin, myprofile } from '../controllers/user.controller.mjs'
import { resendOTP } from '../controllers/resendOtp.controller.mjs';
import { UserRoles } from '../enums/role.enums.mjs';
import authorizer from '../middleware/authorizer.middleware.mjs';


// Define routes for users

/** 
@api {post} /signup signup
  @apiName Signup
  @apiGroup User
    
  @apiBody {String} role Mandatory role of the use (Landlord , Property Manager & Renter) 
  @apiBody {String} fullName full name of the user
  @apiBody {String} email email of the user
  @apiBody {String} phone phone number of user
  @apiBody {String} gender gender of user (male or female)
  @apiBody {String} countryCode country code of user (+91)
  @apiBody {String} password password of user
   
  @apiSuccess {String} id id of user for otp verification
  @apiSuccess {String} otp otp for verfiy user
 
 @apiSuccessExample Success-Response:
      HTTP/1.1 200 OK
     {
    "data": {
        "id": "668bb47011e99860b6e54ba4",
        "otp": "2116"
    },
    "message": "signup successfully. please verify otp",
    "status": true
}
*/

router.post('/signup', signup);


/** 
@api {post} /otpVerification otp verification
  @apiName Otp Verification
  @apiGroup User
    
  @apiBody {String} id user id 
  @apiBody {String} otp otp of the user
   
  @apiSuccess {Object} data data which have information of user
  @apiSuccess {String} accessToken access token of user
  @apiSuccess {Boolean} status status of api true or false
  @apiSuccess {String} message otp verified successfully
  @apiSuccess {Array} additionalData additaional data for api
 
 @apiSuccessExample Success-Response:
      HTTP/1.1 200 OK
   {
    "data": {
        "_id": "668bb47011e99860b6e54ba4",
        "email": "ank2222it@yopmail.com",
        "password": "$2b$10$6EsHtfj5nOreY2arVqWE9.J9zsgS6tltGe2pfblqDZXlzFFGd/4c6",
        "role": "Landlord",
        "fullName": "Ankit",
        "phone": "9988372809",
        "countryCode": "+91",
        "referralCode": "7MQSMTG3",
        "status": true,
        "verified": false,
        "picture": "https://st3.depositphotos.com/6672868/13801/v/1600/depositphotos_138013506-stock-illustration-user-profile-group.jpg",
        "favorite": [],
        "createdAt": "2024-07-08T09:42:08.682Z",
        "updatedAt": "2024-07-08T09:42:08.682Z",
        "otp": "2116",
        "__v": 0
    },
    "message": "otp verified successfully",
    "status": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjMwMjQ4NTcsImRhdGEiOnsiX2lkIjoiNjY4YmI0NzAxMWU5OTg2MGI2ZTU0YmE0IiwiZW1haWwiOiJhbmsyMjIyaXRAeW9wbWFpbC5jb20iLCJwYXNzd29yZCI6IiQyYiQxMCQ2RXNIdGZqNW5PcmVZMmFyVnFXRTkuSjl6c2dTNnRsdEdlMnBmYmxxRFpYbHpGRkdkLzRjNiIsInJvbGUiOiJMYW5kbG9yZCIsImZ1bGxOYW1lIjoiQW5raXQiLCJwaG9uZSI6Ijk5ODgzNzI4MDkiLCJjb3VudHJ5Q29kZSI6Iis5MSIsInJlZmVycmFsQ29kZSI6IjdNUVNNVEczIiwic3RhdHVzIjp0cnVlLCJ2ZXJpZmllZCI6ZmFsc2UsInBpY3R1cmUiOiJodHRwczovL3N0My5kZXBvc2l0cGhvdG9zLmNvbS82NjcyODY4LzEzODAxL3YvMTYwMC9kZXBvc2l0cGhvdG9zXzEzODAxMzUwNi1zdG9jay1pbGx1c3RyYXRpb24tdXNlci1wcm9maWxlLWdyb3VwLmpwZyIsImZhdm9yaXRlIjpbXSwiY3JlYXRlZEF0IjoiMjAyNC0wNy0wOFQwOTo0MjowOC42ODJaIiwidXBkYXRlZEF0IjoiMjAyNC0wNy0wOFQwOTo0MjowOC42ODJaIiwib3RwIjoiMjExNiIsIl9fdiI6MH0sImlhdCI6MTcyMDQzMjg1N30.cI2GkMO6_aqOeD7k_exdEa0lTjGsSMA7nswqnUniyhc",
    "additionalData": []
}
*/

router.post('/otpVerification', userVerification)

/** 
  @api {post} /login login
  @apiName Login
  @apiGroup User
    
  @apiBody {String} email email of the user
  @apiBody {String} password password of the user
   
  @apiSuccess {Object} data data which have information of user
  @apiSuccess {String} accessToken access token of user
  @apiSuccess {Boolean} status status of api true or false
  @apiSuccess {String} message logged in successfully
  @apiSuccess {Array} additionalData additaional data for api
 
 @apiSuccessExample Success-Response:
      HTTP/1.1 200 OK
   {
    "data": {
        "_id": "668bb47011e99860b6e54ba4",
        "email": "ank2222it@yopmail.com",
        "password": "$2b$10$6EsHtfj5nOreY2arVqWE9.J9zsgS6tltGe2pfblqDZXlzFFGd/4c6",
        "role": "Landlord",
        "fullName": "Ankit",
        "phone": "9988372809",
        "countryCode": "+91",
        "referralCode": "7MQSMTG3",
        "status": true,
        "verified": true,
        "picture": "https://st3.depositphotos.com/6672868/13801/v/1600/depositphotos_138013506-stock-illustration-user-profile-group.jpg",
        "favorite": [],
        "createdAt": "2024-07-08T09:42:08.682Z",
        "updatedAt": "2024-07-08T10:00:57.496Z",
        "otp": "2116",
        "__v": 0
    },
    "message": "logged in successfully",
    "status": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjMwMjU0MjQsImRhdGEiOnsiX2lkIjoiNjY4YmI0NzAxMWU5OTg2MGI2ZTU0YmE0IiwiZW1haWwiOiJhbmsyMjIyaXRAeW9wbWFpbC5jb20iLCJwYXNzd29yZCI6IiQyYiQxMCQ2RXNIdGZqNW5PcmVZMmFyVnFXRTkuSjl6c2dTNnRsdEdlMnBmYmxxRFpYbHpGRkdkLzRjNiIsInJvbGUiOiJMYW5kbG9yZCIsImZ1bGxOYW1lIjoiQW5raXQiLCJwaG9uZSI6Ijk5ODgzNzI4MDkiLCJjb3VudHJ5Q29kZSI6Iis5MSIsInJlZmVycmFsQ29kZSI6IjdNUVNNVEczIiwic3RhdHVzIjp0cnVlLCJ2ZXJpZmllZCI6dHJ1ZSwicGljdHVyZSI6Imh0dHBzOi8vc3QzLmRlcG9zaXRwaG90b3MuY29tLzY2NzI4NjgvMTM4MDEvdi8xNjAwL2RlcG9zaXRwaG90b3NfMTM4MDEzNTA2LXN0b2NrLWlsbHVzdHJhdGlvbi11c2VyLXByb2ZpbGUtZ3JvdXAuanBnIiwiZmF2b3JpdGUiOltdLCJjcmVhdGVkQXQiOiIyMDI0LTA3LTA4VDA5OjQyOjA4LjY4MloiLCJ1cGRhdGVkQXQiOiIyMDI0LTA3LTA4VDEwOjAwOjU3LjQ5NloiLCJvdHAiOiIyMTE2IiwiX192IjowfSwiaWF0IjoxNzIwNDMzNDI0fQ.WO0KEr4WYsogBhlpMW1PpukbbWRBL9pDA2fbGnVXlq0",
    "additionalData": []
}
*/

router.post('/login', login);

/** 
  @api {post} /socialLogin socail login
  @apiName socailLogin
  @apiGroup User
    
  @apiBody {String} socialPlatform social platform of the user like ("google", "facebook")
  @apiBody {String} email email of the user
  @apiBody {Boolean} email_verified email verification status (true or false)
  @apiBody {String} name name of the user
  @apiBody {String} picture pic url of the user
  @apiBody {String} exp expiry timestamp

   
  @apiSuccess {Object} data data which have information of user
  @apiSuccess {String} accessToken access token of user
  @apiSuccess {Boolean} status status of api true or false
  @apiSuccess {String} message logged in successfully
  @apiSuccess {Array} additionalData additaional data for api
 
 @apiSuccessExample Success-Response:
      HTTP/1.1 200 OK
   {
    "data": {
        "_id": "668bb47011e99860b6e54ba4",
        "email": "ank2222it@yopmail.com",
        "password": "$2b$10$6EsHtfj5nOreY2arVqWE9.J9zsgS6tltGe2pfblqDZXlzFFGd/4c6",
        "role": "Landlord",
        "fullName": "Ankit",
        "phone": "9988372809",
        "countryCode": "+91",
        "referralCode": "7MQSMTG3",
        "status": true,
        "verified": true,
        "picture": "https://st3.depositphotos.com/6672868/13801/v/1600/depositphotos_138013506-stock-illustration-user-profile-group.jpg",
        "favorite": [],
        "createdAt": "2024-07-08T09:42:08.682Z",
        "updatedAt": "2024-07-08T10:00:57.496Z",
        "otp": "2116",
        "__v": 0
    },
    "message": "logged in successfully",
    "status": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjMwMjU0MjQsImRhdGEiOnsiX2lkIjoiNjY4YmI0NzAxMWU5OTg2MGI2ZTU0YmE0IiwiZW1haWwiOiJhbmsyMjIyaXRAeW9wbWFpbC5jb20iLCJwYXNzd29yZCI6IiQyYiQxMCQ2RXNIdGZqNW5PcmVZMmFyVnFXRTkuSjl6c2dTNnRsdEdlMnBmYmxxRFpYbHpGRkdkLzRjNiIsInJvbGUiOiJMYW5kbG9yZCIsImZ1bGxOYW1lIjoiQW5raXQiLCJwaG9uZSI6Ijk5ODgzNzI4MDkiLCJjb3VudHJ5Q29kZSI6Iis5MSIsInJlZmVycmFsQ29kZSI6IjdNUVNNVEczIiwic3RhdHVzIjp0cnVlLCJ2ZXJpZmllZCI6dHJ1ZSwicGljdHVyZSI6Imh0dHBzOi8vc3QzLmRlcG9zaXRwaG90b3MuY29tLzY2NzI4NjgvMTM4MDEvdi8xNjAwL2RlcG9zaXRwaG90b3NfMTM4MDEzNTA2LXN0b2NrLWlsbHVzdHJhdGlvbi11c2VyLXByb2ZpbGUtZ3JvdXAuanBnIiwiZmF2b3JpdGUiOltdLCJjcmVhdGVkQXQiOiIyMDI0LTA3LTA4VDA5OjQyOjA4LjY4MloiLCJ1cGRhdGVkQXQiOiIyMDI0LTA3LTA4VDEwOjAwOjU3LjQ5NloiLCJvdHAiOiIyMTE2IiwiX192IjowfSwiaWF0IjoxNzIwNDMzNDI0fQ.WO0KEr4WYsogBhlpMW1PpukbbWRBL9pDA2fbGnVXlq0",
    "additionalData": []
}
*/


router.post('/socialLogin', socialLogin)


/** 
@api {post} /resendOtp resend otp
  @apiName resend Otp
  @apiGroup User
    
  @apiBody {String} _id user id 
   
  @apiSuccess {Object} data object which have new otp
  @apiSuccess {String} message otp sent successfully
  @apiSuccess {Boolean} status api status true/false
 
 @apiSuccessExample Success-Response:
      HTTP/1.1 200 OK
   {
    "data": {
        "otp": "6500"
    },
    "message": "otp sent successfully",
    "status": true
}
*/

router.post('/resendOtp', resendOTP)


/** 
@api {get} /my-profile my profile
  @apiName my-profile
  @apiGroup User
    
  @apiHeader (Header) {String} authorization access token of renter , landlord and property manager
   
  @apiSuccess {Object} data object which have user details
  @apiSuccess {String} message fetched user details successfully
  @apiSuccess {Boolean} status api status true/false
 
 @apiSuccessExample Success-Response:
HTTP/1.1 200 OK
{
    "data": {
        "favorite": [],
        "_id": "666bdca8b63d81f4a3cee665",
        "email": "landlord@gmail.com",
        "password": "$2b$10$ly7QqvVhcdiZWVAXGj7CC.JWJv0ddNHae/5IWiekjoldLWEQ6qPqq",
        "role": "Landlord",
        "fullName": "Landlord",
        "phone": "7485968574",
        "countryCode": "+91",
        "referralCode": "YNDRCOQY",
        "status": true,
        "verified": true,
        "picture": "https://st3.depositphotos.com/6672868/13801/v/1600/depositphotos_138013506-stock-illustration-user-profile-group.jpg",
        "createdAt": "2024-06-14T06:01:12.619Z",
        "updatedAt": "2024-06-14T06:01:38.517Z",
        "otp": "4946",
        "__v": 0
    },
    "message": "fetched user details successfully",
    "status": true
}
*/


router.get("/my-profile", authorizer([UserRoles.RENTER, UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), myprofile)



export default router;

