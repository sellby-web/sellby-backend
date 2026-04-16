import { Controller, Get, Query } from '@nestjs/common';
import { AssetService } from './asset.service';

@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}
  @Get('upload-url')
  getUploadUrl(@Query('fileName') fileName: string) {
    return this.assetService.generateUploadUrl(fileName);
  }

  @Get('view-url')
  getViewUrl(@Query('path') path: string) {
    return this.assetService.generateViewUrl(path);
  }
}
