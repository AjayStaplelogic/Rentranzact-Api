import {
    S3Client,
    DeleteObjectsCommand,
    PutObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3"
import fs from "fs"

const s3Client = new S3Client({
    region: process.env.AWS_REGION
});

// const s3Client = new S3Client({
//     region: process.env.AWS_REGION,
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     }
// });


const BUCKET_NAME = process.env.S3_BUCKET_NAME;

/**
 * To add files on s3 bucket
 * 
 * @param {string} filePath Path to read the file from
 * @param {string} keyName File name to register on bucket, can include folder names
 * @param {string} contentType Content type of the file which is uploading
 * @returns {string} keyName , File name from s3
 */
export const uploadFile = async (filePath, keyName, contentType) => {
    console.log(contentType, '==========contentType')
    console.log(filePath, '==========filePath')
    const file = fs.createReadStream(filePath);
    console.log(file, '==========file')

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

/**
 * To remove file from s3
 * 
 * @param {string} fileName Key name placed on s3
 * @returns {void} Nothing
 */
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


/**
 * To remove multiple files from s3
 * 
 * @param {Array} fileNames Array of file names(String)
 * @returns {void} Nothing
 */
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

export const getKeyNameForFileUploaded = (url)=>{
    return url?.split(`${process.env.BUCKET_BASE_URL}/`)?.[1]
}


console.log(getKeyNameForFileUploaded("https://rentranzact.s3.sa-east-1.amazonaws.com/lease-aggrements/66e3efdf9d6c11bc07d26da1d/9b9e22a929c0f0f59ec978c4bf20eb8c4cfd8c9a.pdf"))