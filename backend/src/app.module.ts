import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';  
import { PrismaModule } from './config/prisma.module';
import { CreditModule } from './modules/credit/credit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule, 
    UsersModule,
    PrismaModule,
    CreditModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
