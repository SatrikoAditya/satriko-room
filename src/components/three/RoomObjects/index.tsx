'use client'

import Clocks from '../objects/Clocks'
import Pc from '../objects/Pc'
import PhotoFrame from '../objects/PhotoFrame'
import Printer from '../objects/Printer'

// One line per clickable object; Tasks 12-18 add them.
export default function RoomObjects() {
  return (
    <group name="objects">
      <Pc />
      <PhotoFrame />
      <Printer />
      <Clocks />
    </group>
  )
}
