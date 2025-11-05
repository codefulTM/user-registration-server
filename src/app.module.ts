import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { User } from './user/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Giúp ConfigModule có thể được sử dụng ở mọi nơi
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('DATABASE_URL');
        console.log(dbUrl);
        // Parse the database URL to extract components
        const dbUrlObj = new URL(dbUrl!);

        return {
          type: 'postgres',
          host: dbUrlObj.hostname,
          port: parseInt(dbUrlObj.port, 10),
          username: dbUrlObj.username,
          password: dbUrlObj.password,
          database: dbUrlObj.pathname.replace('/', ''),
          entities: [User],
          synchronize: true, // Set to false in production
          ssl: {
            rejectUnauthorized: false, // Only for development
          },
          // Add URL parameters to the config
          extra: {
            ssl: {
              rejectUnauthorized: false, // Only for development
            },
          },
        };
      },
    }),
    TypeOrmModule.forFeature([User]),
    AuthModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService],
})
export class AppModule {}
