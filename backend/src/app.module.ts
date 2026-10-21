import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration, { AppConfig } from './config/configuration';
import { validate } from './config/env.validation';
import { Menu } from './menus/menu.entity';
import { CreateMenusTable1700000000000 } from './database/migrations/1700000000000-CreateMenusTable';
import { MenusModule } from './menus/menus.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => {
        const db = configService.get('database', { infer: true });
        const nodeEnv = configService.get('nodeEnv', { infer: true });
        return {
          type: 'postgres',
          host: db.host,
          port: db.port,
          username: db.user,
          password: db.password,
          database: db.name,
          entities: [Menu],
          migrations: [CreateMenusTable1700000000000],
          migrationsRun: true,
          synchronize: false,
          logging: nodeEnv === 'development',
        };
      },
    }),
    MenusModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
