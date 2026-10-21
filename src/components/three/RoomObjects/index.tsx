'use client'

import Bookshelf from '../objects/Bookshelf'
import Clocks from '../objects/Clocks'
import DiveGear from '../objects/DiveGear'
import EduFrames from '../objects/EduFrames'
import HikingGear from '../objects/HikingGear'
import IndonesiaMap from '../objects/IndonesiaMap'
import LightSwitch from '../objects/LightSwitch'
import Mailbox from '../objects/Mailbox'
import Pc from '../objects/Pc'
import PhotoFrame from '../objects/PhotoFrame'
import Printer from '../objects/Printer'
import Radio from '../objects/Radio'
import Tv from '../objects/Tv'
import Oyen from '../Oyen'

// One line per clickable object; Tasks 12-18 added them.
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
      <Mailbox />
      <LightSwitch />
      <HikingGear />
      <DiveGear />
      <Tv />
      <Oyen />
    </group>
  )
}
