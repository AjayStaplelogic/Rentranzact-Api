// import AWS from 'aws-sdk';
import {
    S3Client,
    DeleteObjectsCommand,
    GetObjectCommand,
    ListObjectsV2Command,
    HeadObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3"
import fs from "fs"

// const s3Client = new S3Client({
//     region: process.env.AWS_REGION,
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     }
// });

const s3Client = new S3Client({
    region: process.env.AWS_REGION
});


const BUCKET_NAME = process.env.S3_BUCKET_NAME;

export const uploadFile = async (filePath, keyName, contentType) => {
    console.log(contentType, '==========contentType')
    const file = fs.createReadStream(filePath);
    const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: keyName,
        Body: file,
        ContentType: contentType,
        ContentDisposition: 'inline'
    };

    const data = await s3Client.send(new PutObjectCommand(uploadParams));
    console.log(data, '======data')
    if (data) {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                } else {
                    console.log('File deleted successfully.');
                }
            });
        }

        return keyName;
    }
};


export const deleteFileFromAws = async (fileName) => {
    try {
        // Configure the parameters for the S3 upload
        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: fileName,
        };
        // Upload the file to S3
        await s3Client.send(new DeleteObjectCommand(uploadParams)).then((data) => {
        });

    } catch (err) {
        console.error('Error ', err);
        return 'error';
    }
};


export const deleteMultipleFileFromAws = async (fileNames = []) => {
    try {
        // Configure the parameters for the S3 upload
        const uploadParams = {
            Bucket: BUCKET_NAME,
            Delete: {
                // "Objects": [
                //     {
                //         "Key": "HappyFace.jpg",
                //         "VersionId": "2LWg7lQLnY41.maGB5Z6SWW.dcq0vx7b"
                //     },
                //     {
                //         "Key": "HappyFace.jpg",
                //         "VersionId": "yoz3HB.ZhCS_tKVEmIOr7qYyyAaZSKVd"
                //     }
                // ],
                Objects: fileNames.map((item) => {
                    console.log(item, '=====item')
                    return { Key: item }
                }),
                "Quiet": false
            }
        };
        // Upload the file to S3
        const data = await s3Client.send(new DeleteObjectsCommand(uploadParams))
        console.log(data, '======data');
    } catch (err) {
        console.error('Error ', err);
        return 'error';
    }
};

// console.log(await deleteMultipleFileFromAws([
//     'property-media/a7baac7e-b939-4364-bc9e-768f4a0c6646/images/thumbnail-4cce75249930548807cb5052833a75de4dcfabdd.jpg',
//     'property-media/a7baac7e-b939-4364-bc9e-768f4a0c6646/images/compressed-7debd8865eeef1cb2b9e5e162a3c757c6c9863b2.jpg'
// ]))