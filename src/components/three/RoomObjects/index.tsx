'use client'

import Bookshelf from '../objects/Bookshelf'
import Clocks from '../objects/Clocks'
import EduFrames from '../objects/EduFrames'
import IndonesiaMap from '../objects/IndonesiaMap'
import Pc from '../objects/Pc'
import PhotoFrame from '../objects/PhotoFrame'
import Printer from '../objects/Printer'
import Radio from '../objects/Radio'

// One line per clickable object; Tasks 12-18 add them.
export default function RoomObjects() {
  return (
    <group name="objects">
      <Pc />
      <PhotoFrame />
      <Printer />
      <Clocks />
      <Bookshelf />
      <Radio />
      <EduFrames />
      <IndonesiaMap />
    </group>
  )
}
