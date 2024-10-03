# Typeorm Service Library
## service-api

该库为 @aiokit/typeorm 库提供了一些有用的实用程序，这些实用程序公开了可在您的应用程序中使用的有用的基础服务。

该库还从 @aiokit/exceptions 库抛出标准异常。所以拦截器可以正确处理一切。

## Installation

```bash
yarn add @aiokit/service-api
```

## Examples:

- `BaseEntityService` - 它具有创建、查找、更新、归档、删除实体的基本方法。简单的基于CRUD的操作，您也可以用自己的方法扩展它。

```typescript
import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { CustomUserRoleRepository } from '../../repositories';
import { BaseEntityService } from '@aiokit/service-api';
import { IsNull } from 'typeorm';

@Injectable()
export class CustomUserRoleService extends BaseEntityService<CustomUserRole, CustomUserRoleRepository> {
  constructor(repository: CustomUserRoleRepository) {
    super(repository);
  }

  @Transactional()
  async findDefaultRole() {
    return await this.repository.findOne({
      where: {
        roleType: RoleType.REGULAR_USER,
        tenantId: IsNull(),
      },
    });
  }
}
```

- `BaseTenantEntityService` - 它具有创建、查找、更新、归档、删除租户基础实体的基本方法。简单的基于CRUD的操作，您也可以用自己的方法扩展它。

```typescript
@Injectable()
export class CustomUserRoleTenantService extends BaseTenantEntityService<CustomUserRole, CustomUserRoleTenantRepository> {
  constructor(repository: CustomUserRoleTenantRepository) {
    super(repository);
  }
}
```

Tip:

这些服务中的每一个在存储库类型之后的泛型中都有附加参数，用于排除自动生成的类型，确保服务类型安全并且不会因为类型错误而烦恼。

Example (_这将从基本方法和类型中排除 5 个字段，因为它将由订阅者填充_):

```typescript
@Injectable()
export class CustomUserRoleTenantService extends BaseTenantEntityService<CustomUserRole, CustomUserRoleTenantRepository, Pick<CustomUserRole, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>> {
  constructor(repository: CustomUserRoleTenantRepository) {
    super(repository);
  }
}
```
