import active0 from './active/active0.gif'
import active1 from './active/active1.gif'
import active2 from './active/active2.gif'
import active3 from './active/active3.gif'
import active4 from './active/active4.gif'
import active5 from './active/active5.gif'

import sleep0 from './sleep/sleep0.gif'
import sleep1 from './sleep/sleep1.gif'
import sleep2 from './sleep/sleep2.gif'
import sleep3 from './sleep/sleep3.gif'
import sleep4 from './sleep/sleep4.gif'
import sleep5 from './sleep/sleep5.gif'

import alone0 from './alone/alone0.gif'
import alone1 from './alone/alone1.gif'
import alone2 from './alone/alone2.gif'

import social0 from './social/social0.gif'
import social1 from './social/social1.gif'
import social2 from './social/social2.gif'

let activityImages = {
    "active": [active0, active1, active2, active3, active4, active5],
    "sleep": [sleep0, sleep1, sleep2, sleep3, sleep4, sleep5],
}

let socialImages = {
    "social": [social0, social1, social2],
    "alone": [alone0, alone1, alone2],
}

export {activityImages, socialImages} 

// i don' think there is a less stupid way to do this. you can't have variable paths as imports from what i can tell