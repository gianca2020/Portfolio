import { createContext, useContext } from 'react'

/**
 * Whether the device is on screen. False while Recruiter View covers the (still
 * mounted) iPod — timers, slideshows and animations should pause then.
 */
export const DeviceActiveContext = createContext(true)

export const useDeviceActive = () => useContext(DeviceActiveContext)
