import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { UserApi } from './api/user-api';
import { KeycloackService } from './keycloack/keycloack.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
  ],
  controllers: [AppController, UserApi],
  providers: [AppService, KeycloackService],
})
export class AppModule {}
