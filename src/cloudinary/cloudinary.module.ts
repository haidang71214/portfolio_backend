import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config"; 
import { CloudynaryConfig } from "./cloundinary.config";
import { CloudinaryProvider } from "./cloundinary.provider";

@Module({
   imports: [ConfigModule], 
   providers: [CloudynaryConfig, CloudinaryProvider], 
   exports: [CloudinaryProvider]
})
export class CloudinaryModule {}