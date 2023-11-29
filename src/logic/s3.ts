import AWS from 'aws-sdk';
import getenv from 'getenv';
import { Multer } from 'multer';
import mime from 'mime-types';
import { v1 } from 'uuid';
import debug from 'debug';

const Debug = debug('anywize:s3');
const ANYWIZE_DO_SPACES_URL = getenv('ANYWIZE_DO_SPACES_URL');
const ANYWIZE_DO_SPACES_KEY = getenv('ANYWIZE_DO_SPACES_KEY');
const ANYWIZE_DO_SPACES_SECRET = getenv('ANYWIZE_DO_SPACES_SECRET');
const ANYWIZE_DO_SPACES_BUCKET = getenv('ANYWIZE_DO_SPACES_BUCKET');

AWS.config.setPromisesDependency(Promise);

AWS.config.update({
  accessKeyId: ANYWIZE_DO_SPACES_KEY,
  secretAccessKey: ANYWIZE_DO_SPACES_SECRET,
});
const S3 = new AWS.S3({
  endpoint: ANYWIZE_DO_SPACES_URL
});

const getFilename = (file: Express.Multer.File): string => {
  return `${v1()}.${mime.extension(file.mimetype)}`;
};

const getSignedUrl = (key: string): string => {
  Debug(`getSignedUrl ${key}`);

  return S3.getSignedUrl('getObject', {
    Bucket: ANYWIZE_DO_SPACES_BUCKET,
    Key: key,
    Expires: 7200,
  });
}

const upload = async (file: Express.Multer.File): Promise<any> => {
  Debug('Uploading...', file);
  const filename = getFilename(file);

  if (process.env.NODE_ENV === 'test') {
    return filename;
  }

  return new Promise((resolve, reject) => {
    S3.upload({
      Bucket: ANYWIZE_DO_SPACES_BUCKET,
      Key: filename,
      Body: file.buffer,
    }, (err, data: any) => {
      if (err) {
        return reject(err);
      }

      Debug('Uploaded...');

      return resolve(filename);
    });
  });
};

export default {
  getSignedUrl,
  processStopFiles: async (obj: { signature: Express.Multer.File[]; pictures: Express.Multer.File[] }): Promise<any[]> => {
    let signature = null;
    let pictures = [];

    try {
      if (obj.signature && obj.signature.length) {
        signature = await upload(obj.signature[0]);
      }

      if (obj.pictures && obj.pictures.length) {
        pictures = await Promise.all(
          obj.pictures.map((p) => upload(p)),
        );
      }
    } catch (err) {
      Debug(JSON.stringify(err));
    }

    return [signature, pictures];
  },
};
