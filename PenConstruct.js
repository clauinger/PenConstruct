//**-----------------------------------------------------------  */
//** BASE "PEN" CLASS FOR CUSTOM MOUSE-PRESS/DRAG/RELEASE EVENTS */
//**-----------------------------------------------------------  */

/*jshint esversion: 6 */
/*jshint asi: true */
/*jshint expr: true */

const DEV_LOG_ON = false
const {log} = DEV_LOG_ON ? console : {log:()=>{}}

export class PenConstruct {
    constructor() {
        this.mouseDidDrag = false;
        this.returnSnap = null
        this.proximityDistance = 5
        const eventFunction = {
            mousePress: (
                    mousePressPoint,
                    specifiedEventKeys = Object.keys(this.mousePressEventStack)
                ) => {

                this.mousePressSetup(mousePressPoint)

                const needsInitialation = this.userInitializer.evaluateRequirements()
                if (needsInitialation){
                    this.lastEventKey = 'userInitializer'
                    this.userInitializer.exicute(mousePressPoint)
                    return
                } 
                this.userMousePressInfo = null
                if(typeof specifiedEventKeys === 'string'){
                    specifiedEventKeys = [specifiedEventKeys]
                }

                const mousePressEventStackKeys = Object.keys(this.mousePressEventStack)

                specifiedEventKeys.forEach(specifiedEvent =>{
                    if(mousePressEventStackKeys.includes(specifiedEvent) === false){
                        throw new Error(specifiedEvent + ' is not a valid member of mousePressEventStack')
                    } else if (this.userMousePressInfo){
                        return
                    }

                    let findings = this.mousePressEventStack[specifiedEvent].evaluate(
                        mousePressPoint
                        // mousePressPoint,
                        // specifiedEvent
                    )
                    if(!findings){
                        return
                    } else if ((typeof findings ) !== 'object'){
                        findings = {data:findings}
                    }
                    findings.eventKey = specifiedEvent
                    if(findings.eventKey === ''){
                        findings.eventKey = specifiedEvent
                        log(specifiedEvent + 'specifiedEvent was empty string \"\": has been set to ' + specifiedEvent)
                    }
                    this.userMousePressInfo = findings
                    for (const key in findings){
                        log('\t' + key + ': ' + findings[key])
                    }
                })
                
                if (this.userMousePressInfo) {
                    this.lastEventKey = this.userMousePressInfo.eventKey
                    this.mousePressEventStack[this.userMousePressInfo.eventKey].exicute(this.userMousePressInfo)
                    return this.userMousePressInfo//true
                } 
                return false
            },
            mouseDragBegin : ()=>{log('mouseDragBegin')},
            mouseDragContinue : ()=>{log('mouseDragContinue')},
            mouseReleaseAfterDrag : ()=>{log('mouseReleaseAfterDrag')},
            mouseReleaseWithoutDrag : ()=>{log('mouseReleaseWithoutDrag')},
            mouseRelease : ()=>{log('mouseRelease')}
        }
        this.eventFunction = eventFunction

        const clearEventFunctions = ()=>{
            eventFunction.mouseDragBegin = ()=>{}
            eventFunction.mouseDragContinue = ()=>{}
            eventFunction.mouseReleaseAfterDrag = ()=>{}
            eventFunction.mouseReleaseWithoutDrag = ()=>{}
            eventFunction.mouseRelease = ()=>{}
        }
        
        this.evaluateMousePoint = (
            mousePressPoint,
            specifiedEventKeys = Object.keys(this.mousePressEventStack)
        ) => {
            if (typeof specifiedEventKeys === 'string') {
                specifiedEventKeys = [specifiedEventKeys]
            }
            const mousePressEventStackKeys = Object.keys(this.mousePressEventStack)
            let userMousePressInfo = null
            specifiedEventKeys.forEach(specifiedEvent => {
                if (mousePressEventStackKeys.includes(specifiedEvent) === false) {
                    throw new Error(specifiedEvent + ' is not a valid member of mousePressEventStack')
                } else if (userMousePressInfo) {
                    return
                }

                const findings = this.mousePressEventStack[specifiedEvent].evaluate(
                    mousePressPoint,
                    specifiedEvent
                )
                if (findings) {
                    userMousePressInfo = findings
                    for (const key in findings) {
                        log('\t' + key + ': ' + findings[key])
                    }
                }
            })
            return userMousePressInfo
        }

        this.defineEventFunction = function(keyedFunctionPair){

            const key  = Object.keys(keyedFunctionPair)[0]
            switch (key){
                case 'mouseRelease': {
                    eventFunction.mouseReleaseAfterDrag = ()=>{}
                    eventFunction.mouseReleaseWithoutDrag = ()=>{}
                }
                break
                case 'mouseReleaseWithoutDrag': {
                    eventFunction.mouseRelease = ()=>{}
                }
                break
                case 'mouseReleaseAfterDrag': {
                    eventFunction.mouseRelease = ()=>{}
                }
            }
            eventFunction[key] = keyedFunctionPair[key]
        }
//**------------------------------------------------------ */
        this.sendMousePress =  (mousePressPoint) => {
            clearEventFunctions() 
            this.mouseDidDrag = false
            const mousePressInfo = eventFunction.mousePress(mousePressPoint)
            return mousePressInfo
        }

//**------------------------------------------------------ */
        this.sendMouseDrag = (mouseDragPoint)=>{
            if(this.mouseDidDrag === false){
                eventFunction.mouseDragBegin(mouseDragPoint)
                this.mouseDidDrag = true
            }
            eventFunction.mouseDragContinue(mouseDragPoint)
        }

//**------------------------------------------------------ */
        this.sendMouseRelease =  ()=>{
            if(this.mouseDidDrag){
                eventFunction.mouseReleaseAfterDrag()
            } else {
                eventFunction.mouseReleaseWithoutDrag()
            }
            eventFunction.mouseRelease()
            clearEventFunctions()
        }
//**-------------------------------------------------*/
        this.userMousePressInfo
        this.lastEventKey = null
//**--------------------OPTIONAL --------------------*/
        this.mousePressSetup = ()=>{
            /**
            ANY PROCEDURAL CODE PROVIDED HERE 
            WILL RUN IMEADIATELY UPON MOUSE PRESS
            */
        }
//**--------------------OPTIONAL --------------------*/
        this.userInitializer = {
            /** EXAMPLE
            evaluateRequirements : ()=>{},  //   PURE FUNCTION
            exicute  : ()=>{},              //   STATE CHANGE FUNCTION
            */
            evaluateRequirements : ()=>{return false},  //   PURE FUNCTION
            exicute  : ()=>{},                          //   STATE CHANGE FUNCTION
        }
//**--------------------BELOW MUST BE DEFINED IN SUBCLASS --------------------*/
        this.mousePressEventStack = {
            /** EXAMPLE
            mouseClickedOnSomething :{        //   EVENT KEY: NAME IT SOMETHING DESCRIBING THE USER MOUSE PRESS
                evaluate : ()=>{},          //   PURE FUNCTION
                exicute  : ()=>{},          //   STATE CHANGE FUNCTION
            },
            */
        }
    }
    get className(){
        return this.constructor.name
    }
    get mousePressEventStackOrder (){
        return Object.keys(this.mousePressEventStack)
    }
    set mousePressEventStackOrder (setToThisOrder){
        this.mousePressEventStack = getReOrderedObject(this.mousePressEventStack,setToThisOrder)
    }
}



//git remote add origin https://github.com/clauinger/PenConstruct.git