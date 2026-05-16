import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class createAndUpdateImages {
    @ApiProperty()
    @IsString()
    @IsOptional()
    display_order:number

     @ApiProperty({ 
       type: 'string', 
       format: 'binary', 
       description: 'File ảnh gửi lên từ Client', 
       required: false 
     })
     image?: any;
   
     // thực ra cái này nên để là thumbnail
     @ApiHideProperty()
     @IsString()
     images_url?: string;
}
