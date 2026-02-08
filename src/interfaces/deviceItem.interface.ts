import type { IBaseModelFields } from './baseModelFields'

export interface IDeviceItemAttributes extends IBaseModelFields {
  deviceItemId: number
  deviceItemDeviceId: number
  deviceItemValue: string
}

export type IDeviceItemCreationAttributes = Omit<
  IDeviceItemAttributes,
  'deviceItemId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>
