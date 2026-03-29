import dotenv from 'dotenv'
import { type Options, Sequelize } from 'sequelize'
import { appConfigs } from './appConfig'
dotenv.config()

const dataBaseConfig = appConfigs.dataBase.development as Options

export const sequelizeInit = new Sequelize(dataBaseConfig)
