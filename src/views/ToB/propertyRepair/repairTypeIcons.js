import airConditioner from '@/assets/image/propertyRepair/air-conditioner.svg'
import doorsWindows from '@/assets/image/propertyRepair/doors-windows.svg'
import equipment from '@/assets/image/propertyRepair/equipment.svg'
import network from '@/assets/image/propertyRepair/network.svg'
import other from '@/assets/image/propertyRepair/other.svg'
import publicFacilities from '@/assets/image/propertyRepair/public-facilities.svg'
import waterElectric from '@/assets/image/propertyRepair/water-electric.svg'

const repairTypeIcons = {
  水电维修: waterElectric,
  门窗维修: doorsWindows,
  空调维修: airConditioner,
  网络维修: network,
  设备维修: equipment,
  公共设施: publicFacilities,
  其他: other
}

export default function repairTypeIcon(type) {
  return repairTypeIcons[type] || repairTypeIcons.其他
}
