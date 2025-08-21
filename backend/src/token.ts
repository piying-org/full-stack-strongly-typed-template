import { InjectionToken } from 'static-injector';
import type { DataSource } from 'typeorm';

export const DATA_SOURCE = new InjectionToken<DataSource>('DATA_SOURCE');
