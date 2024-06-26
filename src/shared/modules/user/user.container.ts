import { Container } from 'inversify';
import { types } from '@typegoose/typegoose';

import { UserServiceInterface } from './user-service.interface.js';
import { Component } from '../../types/index.js';
import { DefaultUserService } from './default-user.service.js';
import { UserEntity, UserModel } from './user.entity.js';
import { ControllerInterface } from '../../libs/controller/controller.interface.js';
import { UserController } from './user.controller.js';

export function createUserContainer() {
  const container = new Container();
  container
    .bind<UserServiceInterface>(Component.UserService)
    .to(DefaultUserService)
    .inSingletonScope();
  container
    .bind<types.ModelType<UserEntity>>(Component.UserModel)
    .toConstantValue(UserModel);
  container
    .bind<ControllerInterface>(Component.UserController)
    .to(UserController)
    .inSingletonScope();

  return container;
}
