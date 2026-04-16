import { Injectable } from '@nestjs/common';
import { supabase } from 'src/supabase/supabase.client';

@Injectable()
export class AssetService {
  private bucket = process.env.BUCKET_NAME || 'ad-images';

  async generateUploadUrl(fileName: string) {
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .createSignedUploadUrl(fileName);

    if (error) throw error;

    return data;
  }

  async generateViewUrl(path: string) {
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .createSignedUrl(path, 3600);

    if (error) throw error;

    return data;
  }
}
