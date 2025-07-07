import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { Express } from 'express';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucket: string;
  private region: string;

  constructor(private configService: ConfigService) {
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    const region = this.configService.get<string>('AWS_REGION');
    const bucket = this.configService.get<string>('AWS_S3_BUCKET_NAME');

    if (!accessKeyId || !secretAccessKey || !region || !bucket) {
      throw new Error('Missing AWS S3 environment variables');
    }

    this.bucket = bucket;
    this.region = region;

    this.s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = 'uploads',
  ): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const key = `${folder}/${uuidv4()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      Body: file.buffer,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      ContentType: file.mimetype,
    });

    await this.s3.send(command);

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3.send(command);
  }
}
