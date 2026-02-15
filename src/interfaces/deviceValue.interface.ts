import type { IBaseModelFields } from './baseModelFields'

export interface IDeviceValueAttributes extends IBaseModelFields {
  deviceValueId: number
  deviceValueDeviceId: number
  deviceValueValue: string
}

export type IDeviceValueCreationAttributes = Omit<
  IDeviceValueAttributes,
  'deviceValueId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>
