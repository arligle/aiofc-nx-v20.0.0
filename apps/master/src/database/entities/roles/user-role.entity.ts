import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { Permission } from './permission.entity';
import { RoleType } from './types/default-role.enum';
import { BaseTrackedEntityHelper, ClsPreset } from '@aiokit/typeorm';
import { Expose } from 'class-transformer';
import {
  IsNumberLocalized,
  IsStringCombinedLocalized,
  IsStringEnumLocalized,
  IsUUIDLocalized,
} from '@aiokit/validation';
import { IsOptional } from 'class-validator';
import { TenantClsStore } from '@aiokit/persistence-api';

@Entity('roles')
export class UserRole extends BaseTrackedEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  @IsUUIDLocalized()
  id!: string;

  @Column({ type: String, length: 512, nullable: false })
  @Expose()
  @IsStringCombinedLocalized({
    minLength: 1,
    maxLength: 512,
  })
  name!: string;

  @Column({ type: String, length: 1024, nullable: false })
  @Expose()
  @IsStringCombinedLocalized({
    minLength: 1,
    maxLength: 1024,
  })
  description!: string;

  @Column({
    type: 'enum',
    enum: RoleType,
    nullable: true,
  })
  @Expose()
  @IsOptional()
  @IsStringEnumLocalized(RoleType)
  roleType?: RoleType;

  @ManyToMany(() => Permission, { cascade: true, eager: false })
  @JoinTable({
    name: 'user_roles_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions?: Permission[];

  @Column({ nullable: true })
  @Expose()
  @IsOptional()
  @IsUUIDLocalized()
  @ClsPreset<TenantClsStore>({
    clsFieldName: 'tenantId',
  })
  tenantId?: string;

  /**
   * Tenants can have their own roles, but they can also inherit roles from the platform.
   * */
  @ManyToOne(() => Tenant, {
    eager: false,
  })
  @JoinColumn()
  tenant?: Tenant | null;

  @VersionColumn()
  @IsNumberLocalized()
  @Expose()
  version!: number;
}
