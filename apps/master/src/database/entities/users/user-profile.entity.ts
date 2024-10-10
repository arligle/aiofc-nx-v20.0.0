import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';

import { UserProfileStatus } from './types/user-profile-status.enum';
import { BaseTrackedEntityHelper } from '@aiokit/typeorm';
import { UserTenantAccount } from './user-tenant-account.entity';
import {
  IsEmailLocalized,
  IsNumberLocalized,
  IsStringCombinedLocalized,
  IsStringEnumLocalized,
  IsUUIDLocalized,
  PasswordLocalized,
} from '@aiokit/validation';
import { Expose } from 'class-transformer';

@Entity('user_profile')
// TODO: 旧版本的BaseEntityHelper对应新版本的BaseTrackedEntityHelper
export class UserProfile extends BaseTrackedEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  @IsUUIDLocalized()
  id!: string;

  @Column({ type: String, unique: true, nullable: false, length: 320 })
  @Index({ unique: true })
  @Expose()
  @IsEmailLocalized()
  email!: string;

  // having it nullable is useful for set password later logic
  // and for sign in using social networks/sso
  @Column({ nullable: true, length: 256 })
  @Expose()
  @PasswordLocalized()
  password?: string;

  @Column({ type: String, nullable: false, length: 256 })
  @Expose()
  @IsStringCombinedLocalized({ minLength: 1, maxLength: 256 })
  firstName!: string;

  @Column({ type: String, nullable: false, length: 256 })
  @Expose()
  @IsStringCombinedLocalized({ minLength: 1, maxLength: 256 })
  lastName!: string;

  @Column({
    type: 'enum',
    enum: UserProfileStatus,
  })
  @Expose()
  @IsStringEnumLocalized(UserProfileStatus)
  status!: UserProfileStatus;

  @OneToMany(() => UserTenantAccount, (tenantUser) => tenantUser.userProfile, {
    eager: false,
  })
  userTenantsAccounts?: UserTenantAccount[];

  @VersionColumn()
  @IsNumberLocalized()
  @Expose()
  version!: number;
}
