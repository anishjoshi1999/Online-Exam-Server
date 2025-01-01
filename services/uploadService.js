const b2 = require('../config/b2Config');

class UploadService {
  async uploadToB2(file, folder = 'lectures') {
    try {
      // Authorize first
      const auth = await b2.authorize();
      
      // Get bucket info
      const { data } = await b2.getBucket({
        bucketName: process.env.B2_BUCKET_NAME
      });

      if (!data.buckets || data.buckets.length === 0) {
        throw new Error('Bucket not found');
      }

      const bucketId = data.buckets[0].bucketId;

      // Get upload URL with the correct bucketId
      const { data: uploadUrlData } = await b2.getUploadUrl({
        bucketId: bucketId
      });

      // Upload file
      const fileName = `${folder}/${Date.now()}_${file.originalname}`;
      const uploadResponse = await b2.uploadFile({
        uploadUrl: uploadUrlData.uploadUrl,
        uploadAuthToken: uploadUrlData.authorizationToken,
        fileName: fileName,
        data: file.buffer,
        contentType: file.mimetype
      });

      // Construct the download URL
      const downloadUrl = `${auth.data.downloadUrl}/file/${process.env.B2_BUCKET_NAME}/${fileName}`;

      return {
        url: downloadUrl,
        fileName: fileName
      };
    } catch (error) {
      console.error('B2 Upload Error:', error);
      throw new Error(`Failed to upload to B2: ${error.message}`);
    }
  }
}

module.exports = new UploadService();